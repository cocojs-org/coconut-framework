const { compileTs } = require('./_helper');

describe('@constructorParam装饰器', () => {
    it('如果是类，将类作为参数', () => {
        const result = compileTs({
            'index.ts': `
                function logged(value: any, { kind, name }) {
                    if (kind === "class") {
                        return class extends value {} as any
                    }
                }

                class Service {}

                @logged()
                @constructorParam()
                class A {
                    constructor(service: Service) {}
                }
        `,
        });

        const output = Object.values(result).join('\n');
        expect(output).toContain(`@constructorParam([Service])`);
    });

    it('构造函数参数类型是自己的情况', () => {
        const result = compileTs({
            'index.ts': `
                function logged(value: any, { kind, name }) {
                    if (kind === "class") {
                        return class extends value {} as any
                    }
                }

                class Service {}

                @logged()
                @constructorParam()
                class A {
                    constructor(service: A) {}
                }
        `,
        });

        const output = Object.values(result).join('\n');
        expect(output).toContain(`@constructorParam([A])`);
    });
});
