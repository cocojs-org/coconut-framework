import {
    startServe,
    build,
    absProjectPath,
    installCocoMvc,
    installCocoCli,
    removeOldDependencies,
} from './util.ts';
import * as path from 'path';
import * as fs from 'fs';

function installDependenciesForLib(projectDir: string) {
    removeOldDependencies(projectDir);
    installCocoCli(projectDir);
    installCocoMvc(projectDir, 'lib');
}

function installDependenciesForApp(projectDir: string) {
    removeOldDependencies(projectDir);
    installCocoCli(projectDir);
    installCocoMvc(projectDir, 'app');
}

function prepareApp(projectFolder: string) {
    const projectDir = absProjectPath(projectFolder);
    installDependenciesForApp(projectDir);
    build(projectDir);
}
/**
 * 打包一个应用，并启动服务
 * @param projectFolder 应用项目文件夹，只能是 e2e 目录下的文件夹名
 */
async function startServeApp(projectFolder: string) {
    const projectDir = absProjectPath(projectFolder);
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

function prepareLib(projectFolder: string) {
    const projectRoot = absProjectPath(projectFolder);
    const libProjectDir = path.join(projectRoot, 'packages/lib');
    const devProjectDir = path.join(projectRoot, 'packages/dev');
    installDependenciesForLib(libProjectDir);
    build(libProjectDir);
    installDependenciesForApp(devProjectDir);
    build(devProjectDir);
}

async function startLibDevServe(projectFolder: string) {
    const projectDir = absProjectPath(projectFolder);
    const distDir = path.join(projectDir, 'packages/dev/dist');
    const res = await startServe(distDir);
    return res;
}

function readLibDistFile(projectFolder: string) {
    const projectPath = absProjectPath(projectFolder);
    const distPath = path.join(projectPath, 'dist', 'index.esm.js');
    return fs.readFileSync(distPath, 'utf-8');
}

export { startServeApp, stopServeApp, startLibDevServe, readLibDistFile, prepareLib, prepareApp };
