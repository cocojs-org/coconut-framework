import { compileTs } from './_helper'
describe('@component装饰器', () => {
    it('通过返回的类型，确定注入的组件类型', () => {
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
                    @component()
                    hello(): Service {}
                }
        `,
        });

        const output = Object.values(result).join('\n');
        expect(output).toContain(`@component(Service)`);
    });

    it('返回的类型没有定义，但是复合大驼峰的命名规则，也可以正常解析', () => {
        const result = compileTs({
            'index.ts': `
                function logged(value: any, { kind, name }) {
                    if (kind === "class") {
                        return class extends value {} as any
                    }
                }

                @logged()
                class A {
                    @component()
                    hello(): Service {}
                }
        `,
        });

        const output = Object.values(result).join('\n');
        expect(output).toContain(`@component(Service)`);
    });
});
