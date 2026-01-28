describe('@constructorParam装饰器', () => {
    let Application;
    let application;
    let cocoMvc;
    let component;
    let scope;
    let SCOPE;
    let constructorParam;
    let ConstructorParam;
    let consoleErrorSpy;
    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        cocoMvc = await import('@cocojs/mvc');
        Application = cocoMvc.Application;
        component = cocoMvc.component;
        scope = cocoMvc.scope;
        SCOPE = cocoMvc.SCOPE;
        constructorParam = cocoMvc.constructorParam;
        ConstructorParam = cocoMvc.ConstructorParam;
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

    test('支持通过id获取ConstructorParam类', () => {
        application.start();
        const cls = application.getMetaClassById('ConstructorParam');
        expect(cls).toBe(ConstructorParam);
    });

    test('@constructorParam装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @constructorParam()
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@constructorParam',
            'class'
        );
    });

    test('@constructorParam装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @constructorParam()
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@constructorParam',
            'class'
        );
    });

    test('注入原始数据类型会自动传入undefined', () => {
        let fn1: any = 22;
        let fn2: any = 22;
        let fn3: any = 22;
        let fn4: any = 22;
        let fn5: any = 22;
        let fn6: any = 22;
        let fn7: any = 22;

        @component()
        @constructorParam()
        class ButtonA {
            constructor(str: string, num: number, bool: boolean, obj: object, nul: null, und: undefined, sym: symbol) {
                fn1 = str;
                fn2 = num;
                fn3 = bool;
                fn4 = obj;
                fn5 = nul;
                fn6 = und;
                fn7 = sym;
            }
        }

        application.start();
        application.getComponent(ButtonA);
        expect(fn1).toBe(undefined);
        expect(fn2).toBe(undefined);
        expect(fn3).toBe(undefined);
        expect(fn4).toBe(undefined);
        expect(fn5).toBe(undefined);
        expect(fn6).toBe(undefined);
        expect(fn7).toBe(undefined);
    });

    test('注入包装类会自动传入undefined', () => {
        let fn1: any = 22;
        let fn2: any = 22;
        let fn3: any = 22;
        let fn5: any = 22;

        @component()
        @constructorParam()
        class ButtonA {
            constructor(str: String, num: Number, bool: Boolean, sym: Symbol) {
                fn1 = str;
                fn2 = num;
                fn3 = bool;
                fn5 = sym;
            }
        }

        application.start();
        application.getComponent(ButtonA);
        expect(fn1).toBe(undefined);
        expect(fn2).toBe(undefined);
        expect(fn3).toBe(undefined);
        expect(fn5).toBe(undefined);
    });

    test('注入内置对象构造函数会自动传入undefined', () => {
        let fn1: any = 22;
        let fn2: any = 22;
        let fn3: any = 22;
        let fn4: any = 22;
        let fn5: any = 22;

        @component()
        @constructorParam()
        class ButtonA {
            constructor(obj: Object, arr: Array<any>, fn: Function, set: Set<any>, map: Map<any, any>) {
                fn1 = obj;
                fn2 = arr;
                fn3 = fn;
                fn4 = set;
                fn5 = map;
            }
        }

        application.start();
        application.getComponent(ButtonA);
        expect(fn1).toBe(undefined);
        expect(fn2).toBe(undefined);
        expect(fn3).toBe(undefined);
        expect(fn4).toBe(undefined);
        expect(fn5).toBe(undefined);
    });

    test('注入内置对象值会自动传入undefined', () => {
        let fn1: any = 22;
        let fn2: any = 22;
        let fn3: any = 22;

        @component()
        @constructorParam()
        class ButtonA {
            constructor(obj: {}, arr: [], fn: () => {}) {
                fn1 = obj;
                fn2 = arr;
                fn3 = fn;
            }
        }

        application.start();
        application.getComponent(ButtonA);
        expect(fn1).toBe(undefined);
        expect(fn2).toBe(undefined);
        expect(fn3).toBe(undefined);
    });

    // TODO: 未注册的标识符会报：Like is not defined，可以妥善的处理吗？
    xtest('不能识别的标识符会自动传入undefined', () => {
        let fn: any = 22;

        @component()
        @constructorParam()
        class ButtonA {
            // @ts-expect-error - 故意使用未定义的标识符来测试系统如何处理
            constructor(like: Like) {
                fn = like;
            }
        }

        application.start();
        application.getComponent(ButtonA);
        expect(fn).toBe(undefined);
    });

    // TODO: compiler添加对类型的类型兼容
    xtest('申明ts中的类型会自动传入undefined', () => {
        let fn1: any = 22;
        let fn2: any = 22;
        let fn3: any = 22;

        type t = string;
        interface inter {}
        enum e {}

        @component()
        @constructorParam()
        class ButtonA {
            constructor(obj: t, arr: inter, fn: e) {
                fn1 = obj;
                fn2 = arr;
                fn3 = fn;
            }
        }

        application.start();
        application.getComponent(ButtonA);
        expect(fn1).toBe(undefined);
        expect(fn2).toBe(undefined);
        expect(fn3).toBe(undefined);
    });

    describe('初始化的组件的scope都是singleton', () => {
        test('不能通过constructorParam装饰器注入自己，因为constructorParam装饰器在类定义之前执行，这时候被装饰器还未定义', () => {
            let btn: any = 22;

            @constructorParam()
            @component()
            class Button {
                constructor(button: Button) {
                    btn = button;
                }
            }
            application.start();
            application.getComponent(Button);
            expect(btn).toBe(undefined);
        });

        test('不能通过constructorParam装饰器注入词法作用域靠后的类，因为类的声明不会提升，导致constructorParam装饰器拿不到词法作用域靠后的类', () => {
            let fnA: any = 22;
            let fnB: any = 23;

            @component()
            @constructorParam()
            class ButtonA {
                constructor(buttonB: ButtonB) {
                    fnA = buttonB;
                }
            }

            @component()
            @constructorParam()
            class ButtonB {
                constructor(buttonA: ButtonA) {
                    fnB = buttonA;
                }
            }

            application.start();
            const buttonA = application.getComponent(ButtonA);
            expect(fnA).toBe(undefined);
            expect(fnB).toBe(undefined); // 因为ButtonA实际上没有依赖ButtonB，所以不会实例化ButtonB

            application.getComponent(ButtonB);
            expect(fnA).toBe(undefined);
            expect(fnB).toBe(buttonA); // ButtonA是单例，所以直接注入上次的实例
        });
    });

    xdescribe('初始化的组件的scope都是prototype', () => {
        xtest('不能通过constructorParam装饰器注入自己', () => {
            @constructorParam()
            @scope(SCOPE.Prototype)
            @component()
            class Button {
                constructor(button: Button) {}
            }
            application.start();
            try {
                application.getComponent(Button);
            } catch (e) {
                console.log('e', e);
                expect(e.message).toBe('CO10011：实例化组件失败，Button 类通过构造函数注入依赖不能是自己');
            }
        });

        xtest('不能通过autowired装饰器注入自己', () => {});

        xtest('多个构造函数依赖不能直接循环依赖循环', () => {});

        xtest('多个构造函数依赖不能间接循环依赖', () => {});
    });
});
