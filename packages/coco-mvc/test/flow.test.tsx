describe('@flow装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let component;
    let Flow;
    let flow;
    let consoleErrorSpy;
    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        jest.resetModules();
        cocoMvc = await import('@cocojs/mvc');
        Application = cocoMvc.Application;
        Flow = cocoMvc.Flow;
        component = cocoMvc.component;
        flow = cocoMvc.flow;
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

    test('支持通过id获取Effect类', () => {
        application.start();
        const cls = application.getMetaClassById('Flow');
        expect(cls).toBe(Flow);
    });

    test('@flow装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @flow('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@flow',
            'class'
        );
    });

    test('@flow装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @flow('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@flow',
            'class'
        );
    });
});
