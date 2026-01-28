describe('@localStorage装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let LocalStorage;
    let localStorage;
    let component;
    let consoleErrorSpy;
    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        jest.resetModules();
        cocoMvc = await import('@cocojs/mvc');
        Application = cocoMvc.Application;
        LocalStorage = cocoMvc.LocalStorage;
        localStorage = cocoMvc.localStorage;
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

    test('支持通过id获取LocalStorage类', () => {
        application.start();
        const cls = application.getMetaClassById('LocalStorage');
        expect(cls).toBe(LocalStorage);
    });

    test('@localStorage装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @localStorage('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@localStorage',
            'class'
        );
    });

    test('@localStorage装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @localStorage('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@localStorage',
            'class'
        );
    });
});
