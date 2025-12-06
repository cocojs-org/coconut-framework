const fs = require('fs');
const path = require('path');
const rollup = require('rollup');
const assignClassIdPlugin = require('@cocojs/rollup-plugin-assign-class-ssid');
const typescript = require('@rollup/plugin-typescript');

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
    const builder = await rollup.rollup({
        input: input,
        plugins: [
            assignClassIdPlugin(),
            typescript({
                tslib: require.resolve('tslib'),
                compilerOptions: {
                    target: "ESNext",
                    module: "ESNext",
                    jsx: "preserve",
                    allowImportingTsExtensions: false,
                },
                include: ["packages/coco-rollup-plugin-assign-class-ssid/**/*"],
            }),
        ],
    });

    // 3. 生成产物（不写入文件，仅在内存中）
    const { output } = await builder.generate({
        format: 'es', // 输出 ES 模块
    });

    return { code: output[0].code, builder: builder };
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
    const { code, builder } = await bundle(input);
    assertFn(code);
    await builder.close();
}

module.exports.runTest = runTest;