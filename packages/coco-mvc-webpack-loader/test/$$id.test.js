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
            expect(outputCode).toContain('$$id = "Btn"');
        })
    });

    it('有装饰器的类，已经存在$$id，则不做处理', async () => {
        const sourceCode = `
function logged(value: any, { kind, name }) {
    if (kind === "class") {
        return class extends value {} as any
    }
}

@logged
class Btn {
    count: number;
    
    static $$id = 'dontModify';

    render() {};
}
export default Btn;
        `;
        await runTest(sourceCode, (outputCode) => {
            expect(outputCode).toContain("$$id = 'dontModify'");
            expect(outputCode).not.toContain("$$id = 'Btn'");
        })
    });


    it('有装饰器的类，已经存在$$id，但不是字符串字面量，打包报错', async () => {
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
    
    static $$id = undefined;

    render() {};
}
export default Btn;
        `;

        try {
            await runTest(sourceCode);
        } catch (error) {
            if (Array.isArray(error)) {
                threeError = error[0].message;
            }
        }
        expect(threeError).toContain("想要为类Btn自定义\"$$id\"，值必须是字符串字面量");
    });

    it('有装饰器的类，已经存在$$id，但使用空字符串，打包报错', async () => {
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
    
    static $$id = '';

    render() {};
}
export default Btn;
        `;

        try {
            await runTest(sourceCode);
        } catch (error) {
            if (Array.isArray(error)) {
                threeError = error[0].message;
            }
        }
        expect(threeError).toContain("想要为类Btn自定义\"$$id\"，值不能是空字符串");
    });
})
