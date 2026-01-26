import { compileTs } from './_helper'
describe('@autowired装饰器', () => {
    it('复合大驼峰命名规范的标识符则设置成装饰器参数', () => {
        const result = compileTs({
            'index.ts': `
            function log(): ClassDecorator {
                return () => {};
            }
            
            @log()
            class A {
                @autowired()
                service: Service;
            }
        `,
        });

        const output = Object.values(result).join('\n');
        expect(output).toContain(`@autowired(Service)`);
    });

    it('标识符是类，则设置成装饰器参数', () => {
        const result = compileTs({
            'index.ts': `
            function log(): ClassDecorator {
                return () => {};
            }
            
            class Service {}

            @log()
            class A {
                @autowired()
                service: Service;
            }
        `,
        });

        const output = Object.values(result).join('\n');
        expect(output).toContain(`@autowired(Service)`);
    });

    it('没有类型', () => {
        const result = compileTs({
            'index.ts': `
            function log(): ClassDecorator {
                return () => {};
            }
            
            @log()
            class A {
                @autowired()
                user;
            }
        `,
        });

        const output = Object.values(result).join('\n');
        expect(output).toContain(`@autowired()`);
    });
});
