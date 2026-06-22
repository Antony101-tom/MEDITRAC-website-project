const express = require('express');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware: Allows your server to read incoming JSON data from the frontend
app.use(express.json());

// Boot up the database connection
connectDB();

// A simple route to test if the backend server is running
app.get('/', (req, res) => {
    res.send('MediTrac Backend Server is Running!');
});

// Define the port (5000)
const PORT = process.env.PORT || 5000;

// Start listening for web requests
app.listen(PORT, () => {
    console.log(` Server is successfully running on port ${PORT}`);
});