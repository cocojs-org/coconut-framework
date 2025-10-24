describe('@reactive装饰器', () => {
    let Application;
    let application;
    let cocoMvc;
    let view;
    let component;
    let Reactive;
    let reactive;
    let bind;
    let getMetaClassById;
    let consoleWarnSpy;
    let consoleErrorSpy;
    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        view = cocoMvc.view;
        component = cocoMvc.component;
        Reactive = cocoMvc.Reactive;
        reactive = cocoMvc.reactive;
        bind = cocoMvc.bind;
        Application = cocoMvc.Application;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
        jest.resetModules();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    test('支持通过id获取Reactive类', () => {
        application.start();
        const cls = getMetaClassById('Reactive');
        expect(cls).toBe(Reactive);
    });

    test('@reactive装饰器不能装饰在class上', () => {
        @component()
        @reactive()
        class Button {}

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10004：%s 类上class装饰器 %s 只能用于装饰%s',
            'Button',
            '@reactive',
            'field'
        );
    });

    test('@reactive装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @reactive()
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@reactive',
            'field'
        );
    });
});
