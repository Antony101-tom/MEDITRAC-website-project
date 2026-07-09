const express = require('express');
const router = express.Router();
const bcrypt = require('bcrypt');
const { pool } = require('../config/db');

const SALT_ROUNDS = 10;


router.post('/register', async (req, res) => {
    const { accountType, password } = req.body;

    if (!accountType || !['user', 'pharmacy'].includes(accountType)) {
        return res.status(400).json({ message: 'accountType must be "user" or "pharmacy".' });
    }
    if (!password || password.length < 6) {
        return res.status(400).json({ message: 'Password must be at least 6 characters.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);

        if (accountType === 'user') {
            const { full_name, email, phone, location_text } = req.body;

            if (!full_name || !email) {
                return res.status(400).json({ message: 'full_name and email are required.' });
            }

            const result = await pool.query(
                `INSERT INTO patient_user (full_name, email, phone, location_text, password)
                 VALUES ($1, $2, $3, $4, $5)
                 RETURNING user_id, full_name, email, phone, location_text, created_at;`,
                [full_name, email, phone, location_text, hashedPassword]
            );

            return res.status(201).json({
                success: true,
                accountType: 'user',
                message: 'Account created successfully!',
                data: result.rows[0]
            });

        } else {
            // accountType === 'pharmacy'
            const { name, email, phone, address, operating_hours } = req.body;

            if (!name || !email || !address) {
                return res.status(400).json({ message: 'name, email, and address are required.' });
            }

            
            const client = await pool.connect();
            try {
                await client.query('BEGIN');

                const pharmacyResult = await client.query(
                    `INSERT INTO pharmacy (name, phone, email, operating_hours, password)
                     VALUES ($1, $2, $3, $4, $5)
                     RETURNING pharmacy_id, name, email, phone, operating_hours, created_at;`,
                    [name, phone, email, operating_hours || null, hashedPassword]
                );

                const newPharmacy = pharmacyResult.rows[0];

                await client.query(
                    `INSERT INTO location (pharmacy_id, address)
                     VALUES ($1, $2);`,
                    [newPharmacy.pharmacy_id, address]
                );

                await client.query('COMMIT');

                return res.status(201).json({
                    success: true,
                    accountType: 'pharmacy',
                    message: 'Pharmacy account created successfully!',
                    data: newPharmacy
                });

            } catch (err) {
                await client.query('ROLLBACK');
                throw err;
            } finally {
                client.release();
            }
        }

    } catch (err) {
        // Postgres unique constraint violation (duplicate email)
        if (err.code === '23505') {
            return res.status(409).json({ message: 'An account with that email already exists.' });
        }
        console.error('Registration error:', err.message);
        res.status(500).json({ message: 'Server error during registration.' });
    }
});

router.post('/login', async (req, res) => {
    const { accountType, email, password } = req.body;

    if (!accountType || !['user', 'pharmacy'].includes(accountType)) {
        return res.status(400).json({ message: 'accountType must be "user" or "pharmacy".' });
    }
    if (!email || !password) {
        return res.status(400).json({ message: 'Email and password are required.' });
    }

    try {
        const table = accountType === 'user' ? 'patient_user' : 'pharmacy';
        const idColumn = accountType === 'user' ? 'user_id' : 'pharmacy_id';
        const nameColumn = accountType === 'user' ? 'full_name' : 'name';

        const result = await pool.query(
            `SELECT * FROM ${table} WHERE email = $1;`,
            [email]
        );

        if (result.rows.length === 0) {
            // Same message as a wrong password, on purpose -
            // don't reveal whether the email exists or not.
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        const account = result.rows[0];
        const passwordMatches = await bcrypt.compare(password, account.password);

        if (!passwordMatches) {
            return res.status(401).json({ message: 'Invalid email or password.' });
        }

        // Don't send the password hash back to the frontend
        delete account.password;

        res.json({
            success: true,
            accountType,
            message: 'Login successful!',
            data: {
                id: account[idColumn],
                name: account[nameColumn],
                email: account.email
            }
        });

    } catch (err) {
        console.error('Login error:', err.message);
        res.status(500).json({ message: 'Server error during login.' });
    }
});

module.exports = router;