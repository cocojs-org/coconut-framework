const runTest = require('./_helper').runTest

describe('带有装饰器的类添加$$cocoId属性', () => {
    it('没有装饰器的类，不添加$$cocoId', async () => {
        const sourceCode = `
class Btn {
    count: number
}
export default Btn; 
        `;
        await runTest(sourceCode, (outputCode) => {
            expect(outputCode).not.toContain('$$cocoId');
        })
    });

    it('有装饰器的类，会添加$$cocoId属性', async () => {
        const sourceCode = `
function logged(value: any, { kind, name }) {
    if (kind === "class") {
        return class extends value {} as any
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
            expect(outputCode).toContain("$$cocoId = 'Btn'");
        })
    });

    it('有装饰器的类，已经存在$$cocoId，则不做处理', async () => {
        const sourceCode = `
function logged(value: any, { kind, name }) {
    if (kind === "class") {
        return class extends value {} as any
    }
}

@logged
class Btn {
    count: number;
    
    static $$cocoId = 'dontModify';

    render() {};
}
export default Btn;
        `;
        await runTest(sourceCode, (outputCode) => {
            expect(outputCode).toContain("$$cocoId = 'dontModify'");
            expect(outputCode).not.toContain("$$cocoId = 'Btn'");
        })
    });


    it('有装饰器的类，已经存在$$cocoId，但不是字符串字面量，打包报错', async () => {
        let threeError = '';
        const sourceCode = `
function logged(value: any, { kind, name }) {
    if (kind === "class") {
        return class extends value {} as any
    }
}

@logged
class Btn {
    count: number;
    
    static $$cocoId = undefined;

    render() {};
}
export default Btn;
        `;

        try {
            await runTest(sourceCode);
        } catch (error) {
            threeError = error.message;
        }
        expect(threeError).toContain("想要为类Btn自定义\"$$cocoId\"，值必须是字符串字面量");
    });

    it('有装饰器的类，已经存在$$cocoId，但使用空字符串，打包报错', async () => {
        let threeError = '';
        const sourceCode = `
function logged(value: any, { kind, name }) {
    if (kind === "class") {
        return class extends value {} as any
    }
}

@logged
class Btn {
    count: number;
    
    static $$cocoId = '';

    render() {};
}
export default Btn;
        `;

        try {
            await runTest(sourceCode);
        } catch (error) {
            threeError = error.message;
        }
        expect(threeError).toContain("想要为类Btn自定义\"$$cocoId\"，值不能是空字符串");
    });
})
