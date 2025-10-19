describe('@sessionStorage装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let SessionStorage;
    let sessionStorage;
    let component;
    let getMetaClassById;
    let consoleErrorSpy;
    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        SessionStorage = cocoMvc.SessionStorage;
        sessionStorage = cocoMvc.sessionStorage;
        component = cocoMvc.component;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
        consoleErrorSpy.mockRestore();
    });

    test('支持通过id获取SessionStorage类', () => {
        application.start();
        const cls = getMetaClassById('SessionStorage');
        expect(cls).toBe(SessionStorage);
    });

    test('@sessionStorage装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @sessionStorage('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@sessionStorage',
            'class'
        );
    });

    test('@sessionStorage装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @sessionStorage('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@sessionStorage',
            'class'
        );
    });
});
