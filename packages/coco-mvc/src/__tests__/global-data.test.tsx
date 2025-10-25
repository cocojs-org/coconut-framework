describe('@globalData装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let component;
    let view;
    let globalData;
    let GlobalData;
    let autowired;
    let consoleErrorSpy;
    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        component = cocoMvc.component;
        Application = cocoMvc.Application;
        view = cocoMvc.view;
        globalData = cocoMvc.globalData;
        GlobalData = cocoMvc.GlobalData;
        autowired = cocoMvc.autowired;
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

    test('支持通过id获取GlobalData类', () => {
        application.start();
        const cls = application.getMetaClassById('GlobalData');
        expect(cls).toBe(GlobalData);
    });

    test('@globalData装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @globalData('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@globalData',
            'class'
        );
    });

    test('@globalData装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @globalData('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@globalData',
            'class'
        );
    });

    test('可以获取到globalData，并且是同一引用', () => {
        @globalData()
        class Login {
            token: string = 'mock token';
        }
        @view()
        class Button {
            @autowired()
            login: Login;

            render() {
                return <button>btn</button>;
            }
        }
        @view()
        class Button1 {
            @autowired()
            login: Login;

            render() {
                return <button>btn-1</button>;
            }
        }
        application.start();
        const btn = application.getComponent(Button);
        const btn1 = application.getComponent(Button1);
        expect(btn).not.toBe(btn1);
        expect(btn.login).toBe(btn1.login);
        expect(btn.login.token).toBe('mock token');
    });
});
