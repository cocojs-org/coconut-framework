describe('@render装饰器', () => {
    let Application;
    let application;
    let cocoMvc;
    let view;
    let render;
    let component;
    let RenderMeta;
    let consoleWarnSpy;
    let consoleErrorSpy;
    beforeEach(async () => {
        cocoMvc = await import('@cocojs/mvc');
        view = cocoMvc.view;
        render = cocoMvc.render;
        component = cocoMvc.component;
        RenderMeta = cocoMvc.RenderMeta;
        Application = cocoMvc.Application;
        application = new Application();
        cocoMvc.registerMvcApi(application);
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

    test('支持通过id获取Render类', () => {
        application.start();
        const cls = application.getMetaClassById('Render');
        expect(cls).toBe(RenderMeta);
    });

    test('@render装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @render('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@render',
            'class'
        );
    });

    test('@render装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @render('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@render',
            'class'
        );
    });
});
