describe('@value装饰器', () => {
    let Application;
    let application;
    let cocoMvc;
    let component;
    let value;
    let Value;
    let getMetaClassById;
    let consoleErrorSpy;

    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        cocoMvc = await import('coco-mvc');
        value = cocoMvc.value;
        component = cocoMvc.component;
        Application = cocoMvc.Application;
        Value = cocoMvc.Value;
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

    test('支持通过id获取Value类', () => {
        application.start();
        const cls = getMetaClassById('Value');
        expect(cls).toBe(Value);
    });

    test('@value装饰器不能装饰在class上', () => {
        @component()
        @value('path')
        class Button {
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10004：%s 类上class装饰器 %s 只能用于装饰%s',
            'Button',
            '@value',
            'field'
        );
    });

    test('@value装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @value('path')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@value',
            'field'
        );
    });
});
