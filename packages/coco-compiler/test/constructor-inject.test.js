const { compileTs } = require('./_helper');

describe('@constructorInject装饰器', () => {
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
                class A {
                    constructor(service: Service) {}
                }
        `,
        });

        const output = Object.values(result).join('\n');
        expect(output).toContain(`@constructorInject([Service])`);
        expect(output).toContain(`import { constructorInject } from "@cocojs/mvc"`);
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
                class A {
                    constructor(service: A) {}
                }
        `,
        });

        const output = Object.values(result).join('\n');
        expect(output).toContain(`@constructorInject([A])`);
        expect(output).toContain(`import { constructorInject } from "@cocojs/mvc"`);
    });

    it('如果已经有装饰器了，则不修改', () => {
        const result = compileTs({
            'index.ts': `
                function logged(value: any, { kind, name }) {
                    if (kind === "class") {
                        return class extends value {} as any
                    }
                }

                class Service {}

                @logged()
                @constructorInject()
                class A {
                    constructor(service: A) {}
                }
        `,
        });

        const output = Object.values(result).join('\n');
        expect(output).toContain(`@constructorInject()`);
        expect(output).not.toContain(`import { constructorInject } from "@cocojs/mvc"`);
    });
});
