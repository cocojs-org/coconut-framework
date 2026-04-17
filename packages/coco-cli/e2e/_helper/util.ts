import * as http from 'http';
import * as fs from 'fs';
import * as path from 'path';
import { execSync } from 'node:child_process';

function absProjectPath(projectDir: string) {
    return path.join(__dirname, '..', projectDir);
}

function startServe(assertDir) {
    const server = http.createServer((req, res) => {
        const urlPath = !req.url.includes('.js') ? '/index.html' : req.url;
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

// 清楚旧依赖
function removeOldDependencies(projectDir: string) {
    const packageJsonPath = path.join(projectDir, 'package.json');
    const packageJson = fs.readFileSync(packageJsonPath, 'utf8');
    const removeMvc = packageJson.includes('@cocojs/mvc');
    const removeCli = packageJson.includes('@cocojs/cli');
    if (removeMvc || removeCli) {
        execSync(`pnpm remove ${removeMvc ? '@cocojs/mvc' : ''} ${removeCli ? '@cocojs/cli' : ''}`, { stdio: 'inherit', cwd: projectDir });
    }
}

function installCocoCli(projectDir: string) {
    // 要搜索的目录
    const dir = path.join(__dirname, '../..'); // 当前文件所在目录，可改成你需要的路径

    // 同步读取目录
    const files = fs.readdirSync(dir);

    // 匹配：cocojs-cli.xxx.tgz
    const matched = files.filter((file) => /^cocojs-cli.+\.tgz$/.test(file));

    // 转成完整路径
    const result = matched.map((file) => path.resolve(dir, file));
    if (result.length === 1) {
        const gtzFileName = result[0];
        const rltPath = path.relative(projectDir, gtzFileName);
        execSync(`pnpm install ${rltPath} -D`, { stdio: 'inherit', cwd: projectDir });
    } else {
        throw new Error(`Coco coco ${dir} not found`);
    }
}

function installCocoMvc(projectDir: string, projectType: 'lib' | 'app') {
    // 要搜索的目录
    const dir = path.join(__dirname, '../../../coco-mvc'); // 当前文件所在目录，可改成你需要的路径

    // 同步读取目录
    const files = fs.readdirSync(dir);

    // 匹配：cocojs-mvc.xxx.tgz
    const matched = files.filter((file) => /^cocojs-mvc.+\.tgz$/.test(file));

    // 转成完整路径
    const result = matched.map((file) => path.resolve(dir, file));
    if (result.length === 1) {
        const gtzFileName = result[0];
        const rltPath = path.relative(projectDir, gtzFileName);
        execSync(
            `pnpm install ${rltPath} ${projectType === 'lib' ? '-D' : ''}`,
            { stdio: 'inherit', cwd: projectDir }
        );
    } else {
        throw new Error(`Coco coco ${dir} not found`);
    }
}

function build(projectDir) {
    execSync(`pnpm run build`, { stdio: 'inherit', cwd: projectDir });
}

export { absProjectPath, startServe, build, installCocoMvc, installCocoCli, removeOldDependencies };
