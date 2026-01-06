// scripts/test-server.js
const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const DIST_PATH = path.join(__dirname, '..', 'dist');
const BASE_PATH = '/FlowMind-FE';

const MIME_TYPES = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon',
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Parse the URL
    const parsedUrl = url.parse(req.url);
    let pathname = parsedUrl.pathname;

    // Remove base path
    if (pathname.startsWith(BASE_PATH)) {
        pathname = pathname.slice(BASE_PATH.length);
    }

    // Default to index.html
    if (pathname === '/' || pathname === '') {
        pathname = '/index.html';
    }

    const filePath = path.join(DIST_PATH, pathname);
    const extname = path.extname(filePath).toLowerCase();
    const contentType = MIME_TYPES[extname] || 'application/octet-stream';

    fs.readFile(filePath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                // File not found, serve index.html for SPA routing
                fs.readFile(path.join(DIST_PATH, 'index.html'), (err, content) => {
                    if (err) {
                        res.writeHead(500);
                        res.end(`Server Error: ${err.code}`);
                    } else {
                        res.writeHead(200, { 'Content-Type': 'text/html' });
                        res.end(content, 'utf-8');
                    }
                });
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`);
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`🚀 Test server running at http://localhost:${PORT}${BASE_PATH}/`);
    console.log(`📁 Serving from: ${DIST_PATH}`);
    console.log(`🔗 Access: http://localhost:${PORT}${BASE_PATH}/`);
    console.log(`Press Ctrl+C to stop`);
});