import {
    startServe,
    build,
    absProjectPath,
    installDependenciesForLib,
    packCocoCli,
    packCocoMvc,
    installDependenciesForApp,
} from './util.ts';
import * as path from 'path';
import * as fs from 'fs';

function prepareApp(projectFolder: string) {
    packCocoCli();
    packCocoMvc();
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
    packCocoCli();
    packCocoMvc();
    const projectDir = absProjectPath(projectFolder);
    installDependenciesForLib(projectDir);
    build(projectDir);
}

function readLibDistFile(projectFolder: string) {
    const projectPath = absProjectPath(projectFolder);
    const distPath = path.join(projectPath, 'dist', 'index.esm.js');
    return fs.readFileSync(distPath, 'utf-8');
}

export { startServeApp, stopServeApp, readLibDistFile, prepareLib, prepareApp };
