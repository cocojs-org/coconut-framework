const runTest = require('./_helper').runTest

describe('带有装饰器的类添加$$id属性', () => {
    it('没有装饰器的类，不添加$$id', async () => {
        const sourceCode = `
class Btn {
    count: number
}
export default Btn; 
        `;
        await runTest(sourceCode, (outputCode) => {
            expect(outputCode).not.toContain('$$id');
        })
    });

    it('有装饰器的类，会添加$$id属性', async () => {
        const sourceCode = `
function logged(value: any, { kind, name }) {
    if (kind === "class") {
        return class extends value {}
    }
}

@logged
class Btn {
    count: number;
    render() {};
}
export default Btn;
        `;
        await runTest(sourceCode, (outputCode) => {
            expect(outputCode).toContain("$$id = 'Btn'");
        })
    });
})
