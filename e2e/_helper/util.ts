import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'node:child_process';

function startServe(assertDir) {
    const server = http.createServer((req, res) => {
        const urlPath = req.url === '/' ? '/index.html' : req.url;
        const filePath = path.join(assertDir, urlPath);

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

function build(projectDir) {
    execSync(`pnpm install`, { stdio: 'inherit', cwd: projectDir });
    execSync(`pnpm run build`, { stdio: 'inherit', cwd: projectDir });
}

export { startServe, build };