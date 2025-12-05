const runTest = require('./_helper').runTest

describe('带有装饰器的类添加$$id属性', () => {
    it('没有装饰器的类，不添加$$id', async () => {
        await runTest('source-target-1.ts', (outputCode) => {
            expect(outputCode).not.toContain('$$id');
        })
    });

    it('有装饰器的类，会添加$$id属性', async () => {
        await runTest('source-target-2.ts', (outputCode) => {
            expect(outputCode).toContain("$$id = 'Btn'");
        })
    });
})
