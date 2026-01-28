describe('@id装饰器', () => {
    let Application;
    let application;
    let webApplication;
    let configuration;
    let cocoMvc;
    let Metadata;
    let target;
    let Target;
    let component;
    let Component;
    let id;
    let Id;
    let instantiateMetadata;
    let consoleErrorSpy;

    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        cocoMvc = await import('@cocojs/mvc');
        target = cocoMvc.target;
        component = cocoMvc.component;
        Component = cocoMvc.Component;
        id = cocoMvc.id;
        Id = cocoMvc.Id;
        Metadata = cocoMvc.Metadata;
        Target = cocoMvc.Target;
        configuration = cocoMvc.configuration;
        webApplication = cocoMvc.webApplication;
        Application = cocoMvc.Application;
        instantiateMetadata = cocoMvc.instantiateMetadata;
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

    test('支持通过id获取id类', () => {
        application.start();
        const cls = application.getMetaClassById('Id');
        expect(cls).toBe(Id);
    });

    test('@id装饰器不能装饰在class上', () => {
        @id('Button')
        @component()
        class Button {
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10004：%s 类上class装饰器 %s 只能用于装饰%s',
            'Button',
            '@id',
            'method'
        );
    });

    test('@component装饰器不能装饰在field上', () => {
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
            'method'
        );
    });

    describe('@component装饰在方法上', () => {
        test('使用@id自定义之后，可以使用getComponent实例化组件。', () => {
            class Theme {}
            @webApplication()
            class Application {
                @id('CustomComp')
                @component()
                theme(): Theme {
                    return new Theme();
                }
            }

            application.start();
            const theme = application.getComponent('CustomComp');
            expect(theme).toBeInstanceOf(Theme);
        });
    });
});
