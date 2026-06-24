const { Pool } = require('pg');
require('dotenv').config();

// Create a connection pool to the PostgreSQL database
const pool = new Pool({
    connectionString: process.env.DATABASE_URL, // Simplest way to connect via string
});

const connectDB = async () => {
    try {
        await pool.connect();
        console.log('PostgreSQL Database connected successfully!');
    } catch (err) {
        console.error('Database connection failed: ', err.message);
    }
};

module.exports = { pool, connectDB };
