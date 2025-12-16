import { startServe, build } from './util';
import * as path from 'path';

async function startServeApp() {
    const projectDir = path.join(__dirname, '..', 'app-basic-no-style')
    build(projectDir);
    const distDir = path.join(projectDir, 'dist');
    const res = await startServe(distDir);
    return res;
}

async function stopServeApp(res) {
    const { server } = res;
    if (server) {
        server.close();
    }
}

export { startServeApp, stopServeApp };
