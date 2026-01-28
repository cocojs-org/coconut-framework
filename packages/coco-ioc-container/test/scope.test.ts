describe('@scope装饰器', () => {
    let Application;
    let application;
    let webApplication;
    let cocoMvc;
    let Metadata;
    let target;
    let Target;
    let component;
    let id;
    let scope;
    let Scope;
    let SCOPE;
    let consoleErrorSpy;
    let createDecoratorExp;

    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        cocoMvc = await import('@cocojs/mvc');
        target = cocoMvc.target;
        component = cocoMvc.component;
        id = cocoMvc.id;
        scope = cocoMvc.scope;
        Scope = cocoMvc.Scope;
        SCOPE = cocoMvc.SCOPE;
        Metadata = cocoMvc.Metadata;
        Target = cocoMvc.Target;
        webApplication = cocoMvc.webApplication;
        Application = cocoMvc.Application;
        createDecoratorExp = cocoMvc.createDecoratorExp;
        application = new Application();
        cocoMvc.registerMvcApi(application);
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
        jest.resetModules();
        consoleErrorSpy.mockRestore();
    });

    test('支持通过id获取Scope类', () => {
        application.start();
        const cls = application.getMetaClassById('Scope');
        expect(cls).toBe(Scope);
    });

    test('@scope装饰器不能装饰在field上', () => {
        @component()
        class Button {
            @scope()
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@scope',
            'class,method'
        );
    });

    describe('@scope装饰在类上', () => {
        test('本身是singleton的组件装饰器，显式设置singleton模式也还是单例模式', () => {
            @scope(SCOPE.Singleton)
            @component()
            class Theme {}

            application.start();
            const t1 = application.getComponent(Theme);
            const t2 = application.getComponent(Theme);
            expect(t1).toBeInstanceOf(Theme);
            expect(t1).toBe(t2);
        });

        test('支持通过@scope装饰器修改类组件模式的scope设置：singleton模式 -> prototype模式', () => {
            @scope(SCOPE.Prototype)
            @component()
            class Button {}

            application.start();
            const b1 = application.getComponent(Button);
            const b2 = application.getComponent(Button);
            expect(b1).toBeInstanceOf(Button);
            expect(b2).toBeInstanceOf(Button);
            expect(b1).not.toBe(b2);
        });

        test('本身是prototype的组件装饰器，显式设置prototype模式也还是多例模式', () => {
            @target([Target.Type.Class])
            @scope(SCOPE.Prototype)
            @component()
            class PrototypeMeta extends Metadata {}
            const prototype = createDecoratorExp(PrototypeMeta);

            @scope(SCOPE.Prototype)
            @prototype()
            class Button {}

            application.start();
            const b1 = application.getComponent(Button);
            const b2 = application.getComponent(Button);
            expect(b1).toBeInstanceOf(Button);
            expect(b2).toBeInstanceOf(Button);
            expect(b1).not.toBe(b2);
        });

        test('支持通过@scope装饰器修改类组件模式的scope设置：prototype模式 -> singleton模式', () => {
            @target([Target.Type.Class])
            @scope(SCOPE.Prototype)
            @component()
            class PrototypeMeta extends Metadata {}
            const prototype = createDecoratorExp(PrototypeMeta);

            @scope(SCOPE.Singleton)
            @prototype()
            class Theme {}

            application.start();
            const t1 = application.getComponent(Theme);
            const t2 = application.getComponent(Theme);
            expect(t1).toBeInstanceOf(Theme);
            expect(t1).toBe(t2);
        });
    });

    describe('@scope装饰在方法上', () => {
        test('不添加@scope装饰器，默认singleton模式', () => {
            class Theme {}

            @webApplication()
            class Application {
                @id('Theme')
                @component()
                theme(): Theme {
                    return new Theme();
                }
            }

            application.start();
            const t1 = application.getComponent(Theme);
            const t2 = application.getComponent(Theme);
            expect(t1).toBeInstanceOf(Theme);
            expect(t1).toBe(t2);
        });

        test('使用@scope显式设置singleton模式，结果保持单例模式', () => {
            class Theme {}

            @webApplication()
            class Application {
                @id('Theme')
                @scope(SCOPE.Singleton)
                @component()
                theme(): Theme {
                    return new Theme();
                }
            }

            application.start();
            const t1 = application.getComponent(Theme);
            const t2 = application.getComponent(Theme);
            expect(t1).toBeInstanceOf(Theme);
            expect(t1).toBe(t2);
        });

        test('使用@scope装饰器可以设置成Prototype模式', () => {
            class Button {}

            @webApplication()
            class Application {
                @id('Button')
                @scope(SCOPE.Prototype)
                @component()
                button(): Button {
                    return new Button();
                }
            }

            application.start();
            const b1 = application.getComponent(Button);
            const b2 = application.getComponent(Button);
            expect(b1).toBeInstanceOf(Button);
            expect(b2).toBeInstanceOf(Button);
            expect(b1).not.toBe(b2);
        });
    });
});
