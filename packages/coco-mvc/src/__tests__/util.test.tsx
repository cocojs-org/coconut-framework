describe('@util装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let component;
    let Util;
    let util;
    let getMetaClassById;
    let consoleErrorSpy;
    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        Util = cocoMvc.Util;
        component = cocoMvc.component;
        util = cocoMvc.util;
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

    test('支持通过id获取Util类', () => {
        application.start();
        const cls = getMetaClassById('Util');
        expect(cls).toBe(Util);
    });

    test('@util装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @util('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@util',
            'class'
        );
    });

    test('@util装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @util('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@util',
            'class'
        );
    });
});
