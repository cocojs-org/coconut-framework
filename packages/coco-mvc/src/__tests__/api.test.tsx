describe('@api装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let Api;
    let api;
    let component;
    let getMetaClassById;
    let consoleErrorSpy;
    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        Api = cocoMvc.Api;
        api = cocoMvc.api;
        component = cocoMvc.component;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
        jest.resetModules();
        consoleErrorSpy.mockRestore();
    });

    test('支持通过id获取Api类', () => {
        application.start();
        const cls = getMetaClassById('Api');
        expect(cls).toBe(Api);
    });

    test('@api装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @api('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@api',
            'class'
        );
    });

    test('@api装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @api('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@api',
            'class'
        );
    });
});
