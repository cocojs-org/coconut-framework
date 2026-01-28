describe('@webApplication装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let view;
    let component;
    let id;
    let scope;
    let SCOPE;
    let webApplication;
    let WebApplication;
    let consoleErrorSpy;
    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        jest.resetModules();
        cocoMvc = await import('@cocojs/mvc');
        Application = cocoMvc.Application;
        view = cocoMvc.view;
        component = cocoMvc.component;
        id = cocoMvc.id;
        scope = cocoMvc.scope;
        SCOPE = cocoMvc.SCOPE;
        webApplication = cocoMvc.webApplication;
        WebApplication = cocoMvc.WebApplication;
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

    test('支持通过id获取WebApplication类', () => {
        application.start();
        const cls = application.getMetaClassById('WebApplication');
        expect(cls).toBe(WebApplication);
    });

    test('@webApplication装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @webApplication('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@webApplication',
            'class'
        );
    });

    test('@webApplication装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @webApplication('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@webApplication',
            'class'
        );
    });

    test('通过对象传入要注册的ioc组件，默认singleton模式', () => {
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
        expect(t1).toBe(t2);
    });

    test('通过对象传入要注册的ioc组件，可以设置prototype模式', () => {
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
        expect(b1).not.toBe(b2);
    });
});
