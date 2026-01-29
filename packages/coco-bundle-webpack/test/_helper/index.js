const fs = require('fs');
const path = require('path');
const { createFsFromVolume, Volume } = require('memfs');
const { bundle: webpackBundle } = require('@cocojs/bundle-webpack');
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
    function created(compiler) {
        const memoryFs = createFsFromVolume(new Volume());
        compiler.outputFileSystem = memoryFs;
        compiler.outputFileSystem.join = path.join.bind(path);
    }
    const stats = await webpackBundle({ entry: path.join(__dirname, '../input.ts') }, { created: created  });
    const output = stats.toJson({ source: true }).modules[0].source;
    assertFn(output);
}

module.exports.runTest = runTest;
