import { startServe, build, readFileContent } from './util';
import * as path from 'path';
import * as fs from 'fs';

function absProjectPath(projectDir: string) {
    return path.join(__dirname, '..', projectDir);
}
/**
 * 打包一个应用，并启动服务
 * @param projectFolder 应用项目文件夹，只能是 e2e 目录下的文件夹名
 */
async function startServeApp(projectFolder: string) {
    const projectDir = absProjectPath(projectFolder);
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

async function buildLib(projectFolder: string) {
    const projectDir = absProjectPath(projectFolder);
    build(projectDir);
}

function readLibDistFile(projectFolder: string) {
    const projectPath = absProjectPath(projectFolder);
    const distPath = path.join(projectPath, 'dist', 'index.esm.js');
    return fs.readFileSync(distPath, 'utf-8');
}

export { startServeApp, stopServeApp, buildLib, readLibDistFile };
