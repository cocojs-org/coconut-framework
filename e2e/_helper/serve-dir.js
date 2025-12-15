const http = require('http');
const fs = require('fs');
const path = require('path');

function serveDir(root) {
    const server = http.createServer((req, res) => {
        const urlPath = req.url === '/' ? '/index.html' : req.url;
        const filePath = path.join(root, urlPath);

        if (!fs.existsSync(filePath)) {
            res.statusCode = 404;
            res.end('Not Found');
            return;
        }

        res.end(fs.readFileSync(filePath));
    });

    return new Promise(((resolve, reject) => {
        server.listen(0, () => {
            const address = server.address();
            console.info('address', address);
            if (typeof address === 'object' && address) {
                resolve({
                    server,
                    url: `http://localhost:${address.port}`,
                });
            } else {
                reject(new Error('Failed to get server address'));
            }
        });
    }))
}

module.exports.serveDir = serveDir;