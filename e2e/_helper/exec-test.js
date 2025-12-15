const { serveDir } = require('./serve-dir');
const path = require('path');

async function run() {
    const rootDir = path.join(__dirname, '../..', 'fixture', 'app-basic-no-style', 'dist');
    const res = await serveDir(rootDir);
    console.info('rootDir', rootDir, res);
}

run()
