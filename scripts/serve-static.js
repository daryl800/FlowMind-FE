// scripts/serve-static.js
const express = require('express');
const path = require('path');

const app = express();
const PORT = 3000;
const DIST_PATH = path.join(__dirname, '..', 'dist');

// Serve static files
app.use('/FlowMind-FE', express.static(DIST_PATH));

// Handle SPA routing - redirect all other routes to index.html
app.get('/FlowMind-FE/*', (req, res) => {
    res.sendFile(path.join(DIST_PATH, 'index.html'));
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/FlowMind-FE/`);
    console.log(`Press Ctrl+C to stop`);
});