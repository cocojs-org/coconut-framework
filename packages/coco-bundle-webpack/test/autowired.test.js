const runTest = require('./_helper').runTest

describe('@autowired装饰器参数', () => {
    it('支持把字段类型添加为装饰器参数', async () => {
        const sourceCode = `
function component(value: any, { kind, name }) {
    if (kind === "class") {
        return value;
    }
}

function autowired(value: any, { kind, name }) {
    if (kind === "field") {
        // return value;
    }
}

class Api {};

@component()
class Btn {
    @autowired()
    api: Api;
}
export default Btn;
        `;
        await runTest(sourceCode, (outputCode) => {
            expect(outputCode).toContain('autowired(Api)');
        })
    });

})
