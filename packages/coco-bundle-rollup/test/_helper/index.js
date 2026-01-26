const fs = require('fs');
const path = require('path');
const { customBuild } = require('@cocojs/bundle-rollup');

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

async function bundle(input, pluginOpts) {
    const cocoLibBuild = customBuild({ useGenerate: true })
    const { rollupBuild, rollupOutput: { output } } = await cocoLibBuild({
        input: input,
        output: { format: 'es' },
    }, pluginOpts);
    return { code: output[0].code, builder: rollupBuild };
}

/**
 * 执行一次测试用例
 * @param sourceCode 源码
 * @param assertFn  对打包结果断言函数，入参就是输出的字符串
 * @param pluginOpts 插件选项
 * @returns {Promise<void>}
 */
async function runTest(
    sourceCode,
    assertFn = () => {},
    pluginOpts = {}
) {
    await writeCode(sourceCode);
    const input = path.join(__dirname, '..', 'input.ts');
    const { code, builder } = await bundle(input, pluginOpts);
    assertFn(code);
    await builder.close();
}

module.exports.runTest = runTest;
