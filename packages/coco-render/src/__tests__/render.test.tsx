describe('@render装饰器', () => {
    let Application;
    let application;
    let cocoMvc;
    let view;
    let renderDecorator;
    let component;
    let RenderMeta;
    let getMetaClassById;
    let consoleWarnSpy;
    let consoleErrorSpy;
    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        view = cocoMvc.view;
        renderDecorator = cocoMvc.renderDecorator;
        component = cocoMvc.component;
        RenderMeta = cocoMvc.RenderMeta;
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
        jest.resetModules();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    test('支持通过id获取Render类', () => {
        application.start();
        const cls = getMetaClassById('Render');
        expect(cls).toBe(RenderMeta);
    });

    test('@render装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @renderDecorator('field')
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
            @renderDecorator('field')
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
