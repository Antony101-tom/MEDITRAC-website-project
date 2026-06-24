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
// DESC:  Search drug by name to find stock/pharmacy locations
// ==========================================
router.get('/search', async (req, res) => {
    // Get search query from URL parameters (e.g., /api/medications/search?name=Amoxicillin)
    const drugName = req.query.name;

    if (!drugName) {
        return res.status(400).json({ message: 'Please provide a drug name to search for.' });
    }

    try {
        // Querying your friend's exact view with case-insensitive wildcard match (ILIKE)
        const query = `
            SELECT * FROM drug_availability
            WHERE drug_name ILIKE $1
            ORDER BY quantity_available DESC;
        `;
        
        // % wildcards let users search partial names (e.g., "Pan" finds "Paracetamol")
        const values = [`%${drugName}%`];

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

module.exports = router;