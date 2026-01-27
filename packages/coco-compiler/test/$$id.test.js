const { compileTs } = require('./_helper');

describe('添加$$id属性', () => {
    beforeEach(async () => {});

    afterEach(() => {});

    it('没有装饰器的类，不添加$$id', async () => {
        const result = compileTs({
            'index.ts': `
                class Btn {
                    count: number
                }
                export default Btn; 
            `,
        });

        const output = Object.values(result).join('\n');
        expect(output).not.toContain(`$$id`);
    });

    it('有类装饰器的类，会添加$$id属性', () => {
        const result = compileTs({
            'index.ts': `
                    function ClassKind(): ClassDecorator {
                        return () => {};
                    }

                    @ClassKind()
                    class UserService {}
                `,
        });

        const output = Object.values(result).join('\n');
        expect(output).toContain(`static $$id = "UserService"`);
    });

    it('一个文件包含 2 个带装饰器的类，都添加$$id属性', () => {
        const result = compileTs({
            'index.ts': `
                function logged(value: any, { kind, name }) {
                    if (kind === "class") {
                        return class extends value {} as any
                    }
                }

                @logged
                class Card {
                    render() {};
                }

                @logged
                class Btn {
                    count: number;
                    render() {};
                }
                export default Btn;
            `,
        });

        const output = Object.values(result).join('\n');
        expect(output).toContain(`static $$id = "Btn"`);
        expect(output).toContain(`static $$id = "Card"`);
    });

    it('有装饰器的类，已经存在$$id，则不做处理', () => {
        const result = compileTs({
            'index.ts': `
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
            `,
        });

        const output = Object.values(result).join('\n');
        expect(output).toContain(`static $$id = 'dontModify'`);
        expect(output).not.toContain(`static $$id = 'Btn'`);
    });
});
