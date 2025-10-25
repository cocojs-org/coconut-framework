describe('@cookie装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let component;
    let Cookie;
    let cookie;
    let consoleErrorSpy;
    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        Cookie = cocoMvc.Cookie;
        cookie = cocoMvc.cookie;
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

    test('支持通过id获取Cookie类', () => {
        application.start();
        const cls = application.getMetaClassById('Cookie');
        expect(cls).toBe(Cookie);
    });

    test('@cookie装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @cookie('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@cookie',
            'class'
        );
    });

    test('@cookie装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @cookie('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@cookie',
            'class'
        );
    });
});
