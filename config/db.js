const sql = require('mssql');
require('dotenv').config();

const dbConfig = {
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER, 
    database: process.env.DB_DATABASE,
    options: {
        encrypt: true, 
        trustServerCertificate: true // Vital for working over local school Wi-Fi networks
    }
};

async function connectDB() {
    try {
        const pool = await sql.connect(dbConfig);
        console.log('MediTrac successfully connected to MS SQL Server!');
        return pool;
    } catch (err) {
        console.error('Database connection failed: ', err.message);
    }
}

module.exports = {
    sql,
    connectDB
};