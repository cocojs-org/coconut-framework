describe('@layout装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let component;
    let Layout;
    let layout;
    let consoleErrorSpy;
    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        jest.resetModules();
        cocoMvc = await import('@cocojs/mvc');
        Application = cocoMvc.Application;
        Layout = cocoMvc.Layout;
        layout = cocoMvc.layout;
        component = cocoMvc.component;
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

    test('支持通过id获取Layout类', () => {
        application.start();
        const cls = application.getMetaClassById('Layout');
        expect(cls).toBe(Layout);
    });

    test('@layout装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @layout('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@layout',
            'class'
        );
    });

    test('@layout装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @layout('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@layout',
            'class'
        );
    });
});
