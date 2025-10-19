describe('@effect装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let component;
    let Effect;
    let effect;
    let getMetaClassById;
    let consoleErrorSpy;
    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        Effect = cocoMvc.Effect;
        component = cocoMvc.component;
        effect = cocoMvc.effect;
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

    test('支持通过id获取Effect类', () => {
        application.start();
        const cls = getMetaClassById('Effect');
        expect(cls).toBe(Effect);
    });

    test('@effect装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @effect('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@effect',
            'class'
        );
    });

    test('@effect装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @effect('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@effect',
            'class'
        );
    });
});
