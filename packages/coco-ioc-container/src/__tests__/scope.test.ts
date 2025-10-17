describe('@scope装饰器', () => {
    let Application;
    let application;
    let webApplication;
    let cocoMvc;
    let Metadata;
    let target;
    let Target;
    let component;
    let scope;
    let Scope;
    let SCOPE;
    let consoleErrorSpy;
    let createDecoratorExp;
    let getMetaClassById;

    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        cocoMvc = await import('coco-mvc');
        target = cocoMvc.target;
        component = cocoMvc.component;
        scope = cocoMvc.scope;
        Scope = cocoMvc.Scope;
        SCOPE = cocoMvc.SCOPE;
        Metadata = cocoMvc.Metadata;
        Target = cocoMvc.Target;
        webApplication = cocoMvc.webApplication;
        Application = cocoMvc.Application;
        createDecoratorExp = cocoMvc.createDecoratorExp;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });

    afterEach(() => {
        // _test_helper.iocContainer.clear();
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
        consoleErrorSpy.mockRestore();
    });

    test('支持通过id获取Scope类', () => {
        application.start();
        const cls = getMetaClassById('Scope');
        expect(cls).toBe(Scope);
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
