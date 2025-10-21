const http = require('http');
const fs = require('fs');
const path = require('path');

const PORT = 3000;

// MIME types
const mimeTypes = {
    '.html': 'text/html',
    '.js': 'text/javascript',
    '.css': 'text/css',
    '.json': 'application/json',
    '.png': 'image/png',
    '.jpg': 'image/jpg',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
    console.log(`${req.method} ${req.url}`);

    // Default to index.html
    let filePath = req.url === '/' ? '/public/index.html' : req.url;

    // Handle /data requests
    if (filePath.startsWith('/data/')) {
        filePath = filePath; // Keep as is
    } else if (!filePath.startsWith('/public/')) {
        filePath = '/public' + filePath;
    }

    const fullPath = path.join(__dirname, filePath);
    const extname = String(path.extname(fullPath)).toLowerCase();
    const contentType = mimeTypes[extname] || 'application/octet-stream';

    fs.readFile(fullPath, (error, content) => {
        if (error) {
            if (error.code === 'ENOENT') {
                res.writeHead(404, { 'Content-Type': 'text/html' });
                res.end('<h1>404 - File Not Found</h1>', 'utf-8');
            } else {
                res.writeHead(500);
                res.end(`Server Error: ${error.code}`, 'utf-8');
            }
        } else {
            res.writeHead(200, { 'Content-Type': contentType });
            res.end(content, 'utf-8');
        }
    });
});

server.listen(PORT, () => {
    console.log(`\n========================================`);
    console.log(`🗺️  US County Temperature Map Server`);
    console.log(`========================================`);
    console.log(`\n🌐 Server running at: http://localhost:${PORT}`);
    console.log(`\n📊 Data loaded:`);
    console.log(`   - Counties: ${fs.existsSync('./data/counties-albers-10m.json') ? '✓' : '✗'}`);
    console.log(`   - Temperatures: ${fs.existsSync('./data/county-temperatures.json') ? '✓' : '✗'}`);
    console.log(`\n👉 Open http://localhost:${PORT} in your browser\n`);
    console.log(`Press Ctrl+C to stop the server\n`);
});
