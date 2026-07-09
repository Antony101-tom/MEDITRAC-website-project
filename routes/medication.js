const express = require('express');
const router = express.Router();
const { pool } = require('../config/db'); // Imports the PostgreSQL connection pool

// ==========================================
// 1. ROUTE: POST /api/medications
// DESC:  Add a new drug to the master system
// ==========================================
router.post('/', async (req, res) => {
    const { name, generic_name, manufacturer, dosage_form, strength, category } = req.body;

    // Validation: Ensure at least the main drug name is provided
    if (!name) {
        return res.status(400).json({ message: 'Please include at least the drug name.' });
    }

    try {
        // Parameterized query using PostgreSQL syntax ($1, $2, etc.) to block SQL injection
        const query = `
            INSERT INTO drug (name, generic_name, manufacturer, dosage_form, strength, category) 
            VALUES ($1, $2, $3, $4, $5, $6)
            RETURNING *;
        `;

        const values = [name, generic_name, manufacturer, dosage_form, strength, category];

        // Execute query
        const newDrug = await pool.query(query, values);

        // Send back the inserted drug data
        res.status(201).json({ 
            success: true, 
            message: '💊 Drug successfully added to the master list!',
            data: newDrug.rows[0]
        });

    } catch (err) {
        console.error('❌ Database Query Error: ', err.message);
        res.status(500).json({ message: 'Server Database Error' });
    }
});


// ==========================================
// 2. ROUTE: GET /api/medications/search
// DESC:  Search drug by name or generic name to find stock/pharmacy locations
// ==========================================
router.get('/search', async (req, res) => {
    // Get search query from URL parameters (e.g., /api/medications/search?name=Amoxicillin)
    const drugName = req.query.name;

    // Optional: allow explicitly requesting out-of-stock results too,
    // e.g. /api/medications/search?name=Amoxicillin&includeOutOfStock=true
    const includeOutOfStock = req.query.includeOutOfStock === 'true';

    if (!drugName) {
        return res.status(400).json({ message: 'Please provide a drug name to search for.' });
    }

    try {
        // Matches on drug_name OR generic_name, since patients may search
        // by brand name while pharmacies stock under the generic name (or vice versa).
        // By default, excludes out_of_stock results so users don't see phantom matches.
        let query = `
            SELECT * FROM drug_availability
            WHERE (drug_name ILIKE $1 OR generic_name ILIKE $1)
        `;

        const values = [`%${drugName}%`];

        if (!includeOutOfStock) {
            query += ` AND status != 'out_of_stock'`;
        }

        query += ` ORDER BY quantity_available DESC;`;

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ 
                success: false, 
                message: `No pharmacies currently have '${drugName}' in stock.` 
            });
        }

        // Return the pharmacy details, quantities, prices, addresses, and map coordinates
        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (err) {
        console.error('Database Search Error: ', err.message);
        res.status(500).json({ message: 'Server Database Error during search' });
    }
});

// ==========================================
// 3. 
// DESC:  Get all inventory items for a specific pharmacy (for their dashboard)
// ==========================================
router.get('/pharmacy/:pharmacyId', async (req, res) => {
    const { pharmacyId } = req.params;

    try {
        const result = await pool.query(
            `SELECT i.inventory_id, d.name AS drug_name, d.category, d.dosage_form,
                    i.quantity_available, i.price, i.status
             FROM inventory i
             JOIN drug d ON i.drug_id = d.drug_id
             WHERE i.pharmacy_id = $1
             ORDER BY d.name;`,
            [pharmacyId]
        );

        res.json({
            success: true,
            count: result.rows.length,
            data: result.rows
        });

    } catch (err) {
        console.error('Pharmacy inventory fetch error:', err.message);
        res.status(500).json({ message: 'Server error fetching pharmacy inventory.' });
    }
});

// ==========================================
// 4. 
// DESC:  Update stock quantity, price, or status for one inventory item
// ==========================================
router.put('/inventory/:inventoryId', async (req, res) => {
    const { inventoryId } = req.params;
    const { quantity_available, price, status } = req.body;

    if (quantity_available === undefined || price === undefined || !status) {
        return res.status(400).json({ message: 'quantity_available, price, and status are required.' });
    }

    try {
        const result = await pool.query(
            `UPDATE inventory
             SET quantity_available = $1, price = $2, status = $3, last_updated = CURRENT_TIMESTAMP
             WHERE inventory_id = $4
             RETURNING *;`,
            [quantity_available, price, status, inventoryId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'Inventory item not found.' });
        }

        res.json({
            success: true,
            message: 'Stock updated successfully!',
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Inventory update error:', err.message);
        res.status(500).json({ message: 'Server error updating inventory.' });
    }
});

// ==========================================
// 5. 
// DESC:  Add a new medication to a pharmacy's inventory.
//        Finds a matching drug by name, or creates one if it doesn't exist yet.
// ==========================================
router.post('/pharmacy/:pharmacyId/inventory', async (req, res) => {
    const { pharmacyId } = req.params;
    const {
        drug_name, generic_name, manufacturer, dosage_form, strength, category,
        quantity_available, price, status
    } = req.body;

    if (!drug_name || quantity_available === undefined || price === undefined || !status) {
        return res.status(400).json({ message: 'drug_name, quantity_available, price, and status are required.' });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Look for an existing drug with this exact name first
        let drugResult = await client.query(
            `SELECT drug_id FROM drug WHERE name ILIKE $1 LIMIT 1;`,
            [drug_name]
        );

        let drugId;
        if (drugResult.rows.length > 0) {
            drugId = drugResult.rows[0].drug_id;
        } else {
            // Doesn't exist yet — create it
            const newDrug = await client.query(
                `INSERT INTO drug (name, generic_name, manufacturer, dosage_form, strength, category)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING drug_id;`,
                [drug_name, generic_name || null, manufacturer || null, dosage_form || null, strength || null, category || null]
            );
            drugId = newDrug.rows[0].drug_id;
        }

        // Insert the inventory row. If this pharmacy already stocks this drug
        // (unique constraint on drug_id + pharmacy_id), update it instead of erroring.
        const inventoryResult = await client.query(
            `INSERT INTO inventory (drug_id, pharmacy_id, quantity_available, price, status)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (drug_id, pharmacy_id)
             DO UPDATE SET quantity_available = $3, price = $4, status = $5, last_updated = CURRENT_TIMESTAMP
             RETURNING *;`,
            [drugId, pharmacyId, quantity_available, price, status]
        );

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Medication added to your inventory!',
            data: inventoryResult.rows[0]
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Add medication error:', err.message);
        res.status(500).json({ message: 'Server error adding medication.' });
    } finally {
        client.release();
    }
});

module.exports = router;