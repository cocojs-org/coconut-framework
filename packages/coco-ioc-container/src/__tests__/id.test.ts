describe('@id装饰器', () => {
    let Application;
    let application;
    let cocoMvc;
    let Metadata;
    let createDecoratorExp;
    let Id;
    let id;
    let target;
    let Target;
    let component;
    let consoleErrorSpy;

    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        cocoMvc = await import('@cocojs/mvc');
        createDecoratorExp = cocoMvc.createDecoratorExp;
        Metadata = cocoMvc.Metadata;
        Application = cocoMvc.Application;
        Id = cocoMvc.Id;
        id = cocoMvc.id;
        target = cocoMvc.target;
        Target = cocoMvc.Target;
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

    test('getMetaClassById函数可以获取到元数据类', () => {
        application.start();
        const cls = application.getMetaClassById('Id');
        expect(cls).toBe(Id);
    });

    test('@id装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @id('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@id',
            'class'
        );
    });

    test('@id装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @id('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@id',
            'class'
        );
    });

    test('如果不添加@id装饰器，则使用类名作为id', () => {
        @component()
        @target([Target.Type.Class])
        class Log extends Metadata {}

        application.start();
        const MetaCls = application.getMetaClassById('Log');
        expect(MetaCls).toBe(Log);
    });

    test('如果添加@id装饰器，则使用@id装饰器的值作为id', () => {
        @component()
        @target([Target.Type.Class])
        @id('Haha')
        class Log extends Metadata {}

        application.start();
        const MetaCls = application.getMetaClassById('Haha');
        expect(MetaCls).toBe(Log);
    });
});
