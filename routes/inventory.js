const express = require('express');
const router = express.Router();
const { pool } = require('../config/db');

// ==========================================
// DESC: Get the full inventory list for one pharmacy
//       (populates the "Pharmacy Shelf Inventory List" table)
// ==========================================
router.get('/:pharmacyId', async (req, res) => {
    const { pharmacyId } = req.params;

    if (!/^\d+$/.test(pharmacyId)) {
        return res.status(400).json({ message: 'pharmacyId must be a number.' });
    }

    try {
        const result = await pool.query(
            `SELECT
                i.inventory_id,
                d.drug_id,
                d.name AS drug_name,
                d.dosage_form,
                d.strength,
                d.category,
                i.quantity_available,
                i.price,
                i.status,
                i.last_updated
             FROM inventory i
             JOIN drug d ON d.drug_id = i.drug_id
             WHERE i.pharmacy_id = $1
             ORDER BY d.name ASC;`,
            [pharmacyId]
        );

        res.json({ success: true, count: result.rows.length, data: result.rows });

    } catch (err) {
        console.error('Error fetching pharmacy inventory:', err.message);
        res.status(500).json({ message: 'Server error fetching inventory.' });
    }
});


// ==========================================
// DESC: Add a new medication to a pharmacy's stock.
//       If the drug doesn't already exist in the `drug` table, it creates it.
//       If it already exists, it reuses that drug_id.
// ==========================================
router.post('/', async (req, res) => {
    const {
        pharmacy_id, name, generic_name, manufacturer,
        dosage_form, strength, category,
        quantity_available, price
    } = req.body;

    if (!pharmacy_id || !name || quantity_available === undefined || price === undefined) {
        return res.status(400).json({
            message: 'pharmacy_id, name, quantity_available, and price are required.'
        });
    }

    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        // Check if this exact drug (by name) already exists in the master drug list
        let drugResult = await client.query(
            `SELECT drug_id FROM drug WHERE name ILIKE $1 LIMIT 1;`,
            [name]
        );

        let drugId;
        if (drugResult.rows.length > 0) {
            // Reuse the existing drug entry
            drugId = drugResult.rows[0].drug_id;
        } else {
            // Create a new drug entry
            const newDrug = await client.query(
                `INSERT INTO drug (name, generic_name, manufacturer, dosage_form, strength, category)
                 VALUES ($1, $2, $3, $4, $5, $6)
                 RETURNING drug_id;`,
                [name, generic_name || null, manufacturer || null, dosage_form || null, strength || null, category || null]
            );
            drugId = newDrug.rows[0].drug_id;
        }

        // Determine stock status automatically based on quantity
        // (matches the CHECK constraint on inventory.status)
        let status = 'in_stock';
        if (quantity_available === 0) status = 'out_of_stock';
        else if (quantity_available <= 5) status = 'low_stock';

        // Insert or update the inventory row for this pharmacy + drug combo
        const inventoryResult = await client.query(
            `INSERT INTO inventory (drug_id, pharmacy_id, quantity_available, price, status)
             VALUES ($1, $2, $3, $4, $5)
             ON CONFLICT (drug_id, pharmacy_id)
             DO UPDATE SET
                quantity_available = EXCLUDED.quantity_available,
                price = EXCLUDED.price,
                status = EXCLUDED.status,
                last_updated = CURRENT_TIMESTAMP
             RETURNING *;`,
            [drugId, pharmacy_id, quantity_available, price, status]
        );

        await client.query('COMMIT');

        res.status(201).json({
            success: true,
            message: 'Medication added to inventory successfully!',
            data: inventoryResult.rows[0]
        });

    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error adding medication:', err.message);
        res.status(500).json({ message: 'Server error adding medication.' });
    } finally {
        client.release();
    }
});


// ==========================================
// DESC: Update stock quantity/price for one existing inventory row
// ==========================================
router.put('/:inventoryId', async (req, res) => {
    const { inventoryId } = req.params;
    const { quantity_available, price } = req.body;

    if (!/^\d+$/.test(inventoryId)) {
        return res.status(400).json({ message: 'inventoryId must be a number.' });
    }
    if (quantity_available === undefined || price === undefined) {
        return res.status(400).json({ message: 'quantity_available and price are required.' });
    }

    // Auto-calculate status the same way as the add-medication route
    let status = 'in_stock';
    if (quantity_available === 0) status = 'out_of_stock';
    else if (quantity_available <= 5) status = 'low_stock';

    try {
        const result = await pool.query(
            `UPDATE inventory
             SET quantity_available = $1,
                 price = $2,
                 status = $3,
                 last_updated = CURRENT_TIMESTAMP
             WHERE inventory_id = $4
             RETURNING *;`,
            [quantity_available, price, status, inventoryId]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ message: 'No inventory item found with that id.' });
        }

        res.json({
            success: true,
            message: 'Stock updated successfully!',
            data: result.rows[0]
        });

    } catch (err) {
        console.error('Error updating stock:', err.message);
        res.status(500).json({ message: 'Server error updating stock.' });
    }
});

module.exports = router;