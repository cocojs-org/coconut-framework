describe('@component装饰器', () => {
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
    let createDecoratorExp;
    let consoleErrorSpy;
    let Id;

    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        cocoMvc = await import('coco-mvc');
        target = cocoMvc.target;
        component = cocoMvc.component;
        Component = cocoMvc.Component;
        Metadata = cocoMvc.Metadata;
        Target = cocoMvc.Target;
        configuration = cocoMvc.configuration;
        webApplication = cocoMvc.webApplication;
        Application = cocoMvc.Application;
        createDecoratorExp = cocoMvc.createDecoratorExp;
        Id = cocoMvc.Id;
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

    test('支持通过id获取Component类', () => {
        application.start();
        const cls = application.getMetaClassById('Component');
        expect(cls).toBe(Component);
    });

    test('@component装饰器不能装饰在field上', () => {
        @component()
        class Button {
            @component()
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@component',
            'class,method'
        );
    });

    test('Component的类元数据信息是正确的', () => {
        application.start();
        const expected = cocoMvc.checkClassMetadataAsExpected(application, Component, [
            {
                Metadata: Target,
                fieldValues: { value: [Target.Type.Class, Target.Type.Method] },
            },
            {
                Metadata: Id,
                fieldValues: { value: 'Component' },
            },
        ]);
        expect(expected).toEqual(true);
    });

    describe('@component装饰在类上', () => {
        test('不能同时添加2个component装饰器', () => {
            @component()
            @component()
            @target([Target.Type.Class])
            class ErrorButton extends Metadata {}

            application.start();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'CO10003：在一个类上不能添加多次同一个装饰器，但%s上存在重复装饰器: %s',
                'ErrorButton',
                '@component'
            );
        });

        test('不能同时添加component装饰器和一个一级复合装饰器', () => {
            @component()
            @target([Target.Type.Class])
            class FirstLevel extends Metadata {}
            const firstLevel = createDecoratorExp(FirstLevel);
            @firstLevel()
            @component()
            @target([Target.Type.Class])
            class ErrorButton extends Metadata {}

            application.start();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'CO10024：元数据类 %s 存在多个组件装饰器 %s，一个元数据类最多只能有一个组件装饰器。',
                'ErrorButton',
                '@component, @firstLevel'
            );
        });

        test('不能同时添加component装饰器和一个二级复合装饰器', () => {
            @component()
            @target([Target.Type.Class])
            class FirstLevel extends Metadata {}
            const firstLevel = createDecoratorExp(FirstLevel);

            @firstLevel()
            @target([Target.Type.Class])
            class SecondLevel extends Metadata {}
            const secondLevel = createDecoratorExp(SecondLevel);

            @secondLevel()
            @component()
            @target([Target.Type.Class])
            class ErrorButton extends Metadata {}

            application.start();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'CO10024：元数据类 %s 存在多个组件装饰器 %s，一个元数据类最多只能有一个组件装饰器。',
                'ErrorButton',
                '@component, @secondLevel'
            );
        });

        test('不能同时添加2个一级复合装饰器', () => {
            @component()
            @target([Target.Type.Class])
            class FirstLevel1 extends Metadata {}
            const firstLevel1 = createDecoratorExp(FirstLevel1);

            @component()
            @target([Target.Type.Class])
            class FirstLevel2 extends Metadata {}
            const firstLevel2 = createDecoratorExp(FirstLevel2);
            @firstLevel1()
            @firstLevel2()
            @target([Target.Type.Class])
            class ErrorButton extends Metadata {}

            application.start();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'CO10024：元数据类 %s 存在多个组件装饰器 %s，一个元数据类最多只能有一个组件装饰器。',
                'ErrorButton',
                '@firstLevel1, @firstLevel2'
            );
        });

        test('不能同时添加一个一级复合装饰器和一个二级复合装饰器', () => {
            @component()
            @target([Target.Type.Class])
            class FirstLevel1 extends Metadata {}
            const firstLevel1 = createDecoratorExp(FirstLevel1);

            @firstLevel1()
            @target([Target.Type.Class])
            class SecondLevel1 extends Metadata {}
            const secondLevel1 = createDecoratorExp(SecondLevel1);

            @component()
            @target([Target.Type.Class])
            class FirstLevel2 extends Metadata {}
            const firstLevel2 = createDecoratorExp(FirstLevel2);

            @secondLevel1()
            @firstLevel2()
            @target([Target.Type.Class])
            class ErrorButton extends Metadata {}

            application.start();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'CO10024：元数据类 %s 存在多个组件装饰器 %s，一个元数据类最多只能有一个组件装饰器。',
                'ErrorButton',
                '@firstLevel2, @secondLevel1'
            );
        });

        test('不能同时添加2个二级component复合装饰器', () => {
            @component()
            @target([Target.Type.Class])
            class FirstLevel1 extends Metadata {}
            const firstLevel1 = createDecoratorExp(FirstLevel1);

            @firstLevel1()
            @target([Target.Type.Class])
            class SecondLevel1 extends Metadata {}
            const secondLevel1 = createDecoratorExp(SecondLevel1);
            @firstLevel1()
            @target([Target.Type.Class])
            class SecondLevel2 extends Metadata {}
            const secondLevel2 = createDecoratorExp(SecondLevel2);
            @secondLevel1()
            @secondLevel2()
            @target([Target.Type.Class])
            class ErrorButton extends Metadata {}

            application.start();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'CO10024：元数据类 %s 存在多个组件装饰器 %s，一个元数据类最多只能有一个组件装饰器。',
                'ErrorButton',
                '@secondLevel1, @secondLevel2'
            );
        });
    });

    describe('@component装饰在方法上', () => {
        test('使用component注入第三方组件，必须在配置类内部。', () => {
            class Theme {}
            @component()
            class Application {
                @component()
                theme() {
                    return new Theme();
                }
            }

            application.start();
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'CO10008：%s 类 %s 方法上有@component装饰器，但 %s 没有@configuration类装饰器或@configuration的复合装饰器',
                'Application',
                'theme',
                'Application'
            );
        });

        test('当返回的类型未定义时，会运行时报错：ReferenceError: Xxx is not defined', () => {
            let errmsg = '';
            try {
                @configuration()
                class Application {
                    @component()
                    theme(): Theme {
                        return new Theme();
                    }
                }

                application.start();
            } catch (e) {
                errmsg = e.message;
            }
            expect(errmsg).toBe('Theme is not defined');
        });

        // TODO:
        xtest('不支持注入number类型', () => {
            @webApplication()
            class Application {
                @component()
                theme() {
                    return 1;
                }
            }
        });

        // TODO:
        xtest('不支持注入string类型', () => {
            @webApplication()
            class Application {
                @component()
                theme() {
                    return '1';
                }
            }
        });

        // TODO:
        xtest('不支持注入boolean类型', () => {
            @webApplication()
            class Application {
                @component()
                theme() {
                    return true;
                }
            }
        });

        // TODO:
        xtest('不支持注入Symbol类型', () => {
            @webApplication()
            class Application {
                @component()
                theme() {
                    return Symbol('1');
                }
            }
        });

        // TODO:
        xtest('不支持注入Array类型', () => {
            @webApplication()
            class Application {
                @component()
                theme() {
                    return [1, 2, 3];
                }
            }
        });

        // TODO:
        xtest('不支持注入Object类型', () => {
            @webApplication()
            class Application {
                @component()
                theme() {
                    return { name: '1' };
                }
            }
        });

        // TODO:
        xtest('不支持注入Set类型', () => {
            @webApplication()
            class Application {
                @component()
                theme() {
                    return new Set([1, 2, 3]);
                }
            }
        });

        // TODO:
        xtest('不支持注入Map类型', () => {
            @webApplication()
            class Application {
                @component()
                theme() {
                    return new Map([
                        ['1', 1],
                        ['2', 2],
                        ['3', 3],
                    ]);
                }
            }
        });
    });
});
