const fs = require('fs');
const path = require('path');
const webpack = require('webpack');
const { createFsFromVolume, Volume } = require('memfs');
require('setimmediate');

async function writeCode(sourceCode) {
    const targetFilePath = path.resolve(__dirname, '..', 'input.ts');
    if (!fs.existsSync(targetFilePath)) {
        fs.mkdirSync(path.dirname(targetFilePath), { recursive: true });
    }

    const content = `
/**
 * ===不要提交此文件===
 * ===不要提交此文件===
 * ===不要提交此文件===
 */
${sourceCode}
    `
    fs.writeFileSync(targetFilePath, content, 'utf8');
}

async function bundle(input) {
    const compiler = webpack({
        mode: 'development',
        entry: path.join(__dirname, '../input.ts'),
        module: {
            rules: [
                {
                    test: /\.tsx?$/,
                    use: [
                        {
                            loader: require.resolve('babel-loader'),
                            options: {
                                plugins: [
                                    [require.resolve('@babel/plugin-proposal-decorators'), { version: '2023-11' }],
                                ],
                            },
                        },
                        {
                            loader: require.resolve('@cocojs/webpack-loader-mvc')
                        },
                    ],
                    exclude: /node_modules/,
                },
            ],
        },
        resolveLoader: {
            modules: [path.resolve(__dirname, '../../node_modules'), 'node_modules'],
        },
        resolve: {
            extensions: ['.tsx', '.ts', '.jsx', '.js', '.json'],
            alias: {
                '@': path.resolve(process.cwd(), 'src/'),
            },
        },
        output: {
            publicPath: '/',
            filename: 'main.js',
            path: path.join(process.cwd(), 'dist'),
            clean: true,
        },
    });

    compiler.outputFileSystem = createFsFromVolume(new Volume());
    compiler.outputFileSystem.join = path.join.bind(path);

    return new Promise(((resolve, reject) => {
        compiler.run((err, stats) => {
            if (err) {
                reject(err);
            }
            if (stats.hasErrors()) {
                reject(stats.toJson().errors);
            }
            resolve(stats);
            const errMsg = stats.toString('errors-only')
            if (errMsg) {console.log(errMsg)}
            compiler.close((err) => {});
        });
    }));
}

/**
 * 执行一次测试用例
 * @param sourceCode 源码
 * @param assertFn  对打包结果断言函数，入参就是输出的字符串
 * @returns {Promise<void>}
 */
async function runTest(
    sourceCode,
    assertFn = () => {},
) {
    await writeCode(sourceCode);
    const input = path.join(__dirname, '..', 'input.ts');
    const stats = await bundle(input);
    const output = stats.toJson({ source: true }).modules[0].source;
    assertFn(output);
}

module.exports.runTest = runTest;
