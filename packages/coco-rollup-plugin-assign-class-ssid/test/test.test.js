const rollup = require('rollup');
const virtual = require('@rollup/plugin-virtual');
const assignClassIdPlugin = require('@cocojs/rollup-plugin-assign-class-ssid');
// TODO: 按照完整的打包流程准备测试用例
// const typescript = require('@rollup/plugin-typescript');
const babel = require('@rollup/plugin-babel');

describe('assign class ssid', () => {
    it('没有装饰器的类，不添加ssid', async () => {
        const sourceCode = `
            class Btn {
                render() {};
            }
            export default Btn;
        `;

        // 2. 初始化 Rollup 构建
        const bundle = await rollup.rollup({
            // 虚拟入口（@rollup/plugin-virtual 会匹配这个 id）
            input: 'virtual:test-entry',
            plugins: [
                // 第一步：虚拟加载测试代码
                virtual({
                    'virtual:test-entry': sourceCode,
                }),
                assignClassIdPlugin(),
                babel({
                    extensions: ['.ts', '.js'],
                    presets: ['@babel/preset-env'],
                }),
            ],
        });

        // 3. 生成产物（不写入文件，仅在内存中）
        const { output } = await bundle.generate({
            format: 'es', // 输出 ES 模块
        });

        // 4. 断言验证
        const outputCode = output[0].code; // 获取产物代码
        // 验证类是否添加了 id 属性（根据你的插件逻辑调整断言）
        expect(outputCode).not.toContain('$$id');

        // 5. 清理 bundle
        await bundle.close();
    });

    it('有装饰器的类，会添加$$id属性', async () => {
        const sourceCode = `
            const bind = () => {};
            
            @bind
            class Btn {
                render() {};
            }
            export default Btn;
        `;

        // 2. 初始化 Rollup 构建
        const bundle = await rollup.rollup({
            // 虚拟入口（@rollup/plugin-virtual 会匹配这个 id）
            input: 'virtual:test-entry',
            plugins: [
                // 第一步：虚拟加载测试代码
                virtual({
                    'virtual:test-entry': sourceCode,
                }),
                // 第二步：你的自定义插件
                assignClassIdPlugin(),
            ],
        });

        // 3. 生成产物（不写入文件，仅在内存中）
        const { output } = await bundle.generate({
            format: 'es', // 输出 ES 模块
        });

        // 4. 断言验证
        const outputCode = output[0].code; // 获取产物代码
        // 验证类是否添加了 id 属性（根据你的插件逻辑调整断言）
        expect(outputCode).toContain("$$id = 'Btn'");

        // 5. 清理 bundle
        await bundle.close();
    });
})
