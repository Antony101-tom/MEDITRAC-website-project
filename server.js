const express = require('express');
const cors = require('cors');
const { connectDB } = require('./config/db');
require('dotenv').config();

const app = express();

// Middleware: Allows your frontend (running on a different port) to call this API
app.use(cors());

// Middleware: Allows your server to read incoming JSON data from the frontend
app.use(express.json());

// Boot up the database connection
connectDB();

// --- LINK YOUR ROUTES HERE ---
// This imports your medication file and points the path /api/medications to it
app.use('/api/medications', require('./routes/medication'));


app.use('/api/inventory', require('./routes/inventory'));

// This imports your auth file and points the path /api/auth to it
app.use('/api/auth', require('./routes/auth'));

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