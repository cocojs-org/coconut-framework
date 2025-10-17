describe('create-decorator-exp:createDecoratorExpFactory', () => {
    let cocoMvc;
    let createDecoratorExpFactory;
    let KindClass;
    let KindField;
    let KindMethod;
    let Application;
    let application;
    let getMetaClassById;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        createDecoratorExpFactory = cocoMvc.createDecoratorExpFactory;
        KindClass = cocoMvc.KindClass;
        KindField = cocoMvc.KindField;
        KindMethod = cocoMvc.KindMethod;
        application = new Application();
        getMetaClassById = cocoMvc.getMetaClassById;
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
    });

    test('类装饰器，不需要实例化就拿到装饰器参数', () => {
        const fn = jest.fn();
        const create = createDecoratorExpFactory(fn);

        class Meta {}
        const m = create(false, Meta);
        const param = 22;
        @m(param)
        class A {}
        expect(fn).toBeCalledTimes(1);
        expect(fn).toBeCalledWith(false, A, {
            metadataClass: Meta,
            metadataKind: KindClass,
            metadataParam: param,
        });
    });

    test('类装饰器，实例化多次但不会再次调用记录装饰器参数的回调', () => {
        const fn = jest.fn();
        const createDE = createDecoratorExpFactory(fn);
        class Meta1 {}
        const m = createDE(false, Meta1);
        const param = 22;
        @m(param)
        class A {}
        expect(fn).toBeCalledTimes(1);
        expect(fn).toBeCalledWith(false, A, {
            metadataClass: Meta1,
            metadataKind: KindClass,
            metadataParam: param,
        });
        // 多次实例化操作
        new A();
        expect(fn).toBeCalledTimes(1);
        new A();
        expect(fn).toBeCalledTimes(1);
    });

    test('filed装饰器，需要实例化一次拿到装饰器参数', () => {
        const fn = jest.fn();
        const create = createDecoratorExpFactory(fn);

        class Meta2 {}
        const m = create(false, Meta2);
        const param = 22;
        class A {
            @m(param)
            f;
        }
        expect(fn).toBeCalledTimes(0);
        new A();
        expect(fn).toBeCalledTimes(1);
        expect(fn).toBeCalledWith(false, A, {
            metadataClass: Meta2,
            metadataKind: KindField,
            metadataParam: param,
            field: 'f',
        });
    });

    test('method装饰器，需要实例化一次拿到装饰器参数', () => {
        const fn = jest.fn();
        const create = createDecoratorExpFactory(fn);

        class Meta3 {}
        const m = create(false, Meta3);
        const param = 22;
        class A {
            @m(param)
            fn() {}
        }
        expect(fn).toBeCalledTimes(0);
        new A();
        expect(fn).toBeCalledTimes(1);
        expect(fn).toBeCalledWith(false, A, {
            metadataClass: Meta3,
            metadataKind: KindMethod,
            metadataParam: param,
            field: 'fn',
        });
    });

    test('filed装饰器，只有第一次实例化会记录装饰器参数，后续实例化都不会', () => {
        const fn = jest.fn();
        const create = createDecoratorExpFactory(fn);

        class Meta4 {}
        const m = create(false, Meta4);
        const param = 22;
        class A {
            @m(param)
            f;
        }
        expect(fn).toBeCalledTimes(0);
        new A();
        expect(fn).toBeCalledTimes(1);
        expect(fn).toBeCalledWith(false, A, {
            metadataClass: Meta4,
            metadataKind: KindField,
            metadataParam: param,
            field: 'f',
        });
        new A();
        expect(fn).toBeCalledTimes(1);
        new A();
        expect(fn).toBeCalledTimes(1);
        new A();
        expect(fn).toBeCalledTimes(1);
    });

    test('method装饰器，只有第一次实例化会记录装饰器参数，后续实例化都不会', () => {
        const fn = jest.fn();
        const create = createDecoratorExpFactory(fn);

        class Meta5 {}
        const m = create(false, Meta5);
        const param = 22;
        class A {
            @m(param)
            fn() {}
        }
        expect(fn).toBeCalledTimes(0);
        new A();
        expect(fn).toBeCalledTimes(1);
        expect(fn).toBeCalledWith(false, A, {
            metadataClass: Meta5,
            metadataKind: KindMethod,
            metadataParam: param,
            field: 'fn',
        });
        new A();
        expect(fn).toBeCalledTimes(1);
        new A();
        expect(fn).toBeCalledTimes(1);
        new A();
        expect(fn).toBeCalledTimes(1);
    });

    test('不能装饰getter', () => {
        let shouldThrowError = false;
        try {
            const fn = jest.fn();
            const create = createDecoratorExpFactory(fn);

            class Meta6 {}
            // TODO: 如果在测试文件中引用类型？const m: () => Decorator<ClassGetterDecoratorContext> = create(Meta6);
            const m = create(false, Meta6);

            class A {
                @m()
                get g() {
                    return 1;
                }
            }
        } catch (e) {
            shouldThrowError = true;
        }
        expect(shouldThrowError).toBe(true);
    });

    test('不能装饰setter', () => {
        let shouldThrowError = false;
        try {
            const fn = jest.fn();
            const create = createDecoratorExpFactory(fn);

            class Meta7 {}
            const m = create(false, Meta7);

            class A {
                @m()
                set s(v: number) {}
            }
        } catch (e) {
            shouldThrowError = true;
        }
        expect(shouldThrowError).toBe(true);
    });
});

describe('create-decorator-exp:createDecoratorExp', () => {
    let cocoMvc;
    let Metadata;
    let createDecoratorExp;
    let createPlaceholderDecoratorExp;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        Metadata = cocoMvc.Metadata;
        createDecoratorExp = cocoMvc.createDecoratorExp;
        createPlaceholderDecoratorExp = cocoMvc.createPlaceholderDecoratorExp;
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        jest.resetModules();
    });

    test('一个元数据创建多个装饰器会报错', () => {
        let errorMsg = '';
        class M extends Metadata {}
        try {
            createDecoratorExp(M);
            createDecoratorExp(M);
        } catch (error) {
            errorMsg = error.message;
        }
        expect(errorMsg).toBe('CO10014：元数据类 M 创建了不止一个装饰器，每个元数据类只能创建一个对应的装饰器。');
    });

    test('一个元数据创建多个装饰器会报错', () => {
        let errorMsg = '';

        const d = createPlaceholderDecoratorExp();
        @d.decorateSelf()
        class M extends Metadata {}
        try {
            createDecoratorExp(M);
        } catch (error) {
            errorMsg = error.message;
        }
        expect(errorMsg).toBe('CO10014：元数据类 M 创建了不止一个装饰器，每个元数据类只能创建一个对应的装饰器。');
    });

    test('createDecoratorExp第一个参数必须是Metadata的子类', () => {
        let errorMsg = '';
        try {
            class A {}
            createDecoratorExp(A);
        } catch (e) {
            errorMsg = e.message;
        }
        expect(errorMsg).toBe('CO10018：createDecoratorExp的第一个参数 A 必须是Metadata的子类。');
    });

    test('createDecoratorExp第一个参数不能使用数字', () => {
        let shouldThrowError = false;
        try {
            // @ts-ignore
            createDecoratorExp(1);
        } catch (e) {
            shouldThrowError = true;
        }
        expect(shouldThrowError).toBe(true);
    });

    test('createDecoratorExp第一个参数不能使用字符串', () => {
        let shouldThrowError = false;
        try {
            // @ts-ignore
            createDecoratorExp('abc');
        } catch (e) {
            shouldThrowError = true;
        }
        expect(shouldThrowError).toBe(true);
    });

    test('createDecoratorExp第一个参数不能使用对象', () => {
        let shouldThrowError = false;
        try {
            // @ts-ignore
            createDecoratorExp({});
        } catch (e) {
            shouldThrowError = true;
        }
        expect(shouldThrowError).toBe(true);
    });

    test('createDecoratorExp第一个参数不能使用函数', () => {
        let shouldThrowError = false;
        try {
            // @ts-ignore
            createDecoratorExp(function () {});
        } catch (e) {
            shouldThrowError = true;
        }
        expect(shouldThrowError).toBe(true);
    });

    describe('create-decorator-exp:createPlaceholderDecoratorExp', () => {
        let cocoMvc;
        let Metadata;
        let createPlaceholderDecoratorExp;
        let Application;
        let application;
        let getMetaClassById;
        let target;
        let Target;
        let id;

        beforeEach(async () => {
            cocoMvc = await import('coco-mvc');
            Metadata = cocoMvc.Metadata;
            createPlaceholderDecoratorExp = cocoMvc.createPlaceholderDecoratorExp;
            target = cocoMvc.target;
            Target = cocoMvc.Target;
            id = cocoMvc.id;
            Application = cocoMvc.Application;
            application = new Application();
            getMetaClassById = cocoMvc.getMetaClassById;
            cocoMvc.registerMvcApi(application, getMetaClassById);
        });

        afterEach(() => {
            cocoMvc.cleanCache();
            cocoMvc.unregisterMvcApi();
            jest.resetModules();
        });

        test('一个元数据创建多个装饰器会报错', () => {
            let errorMsg = '';
            try {
                const d1 = createPlaceholderDecoratorExp();
                const d2 = createPlaceholderDecoratorExp();

                @d1.decorateSelf()
                @d2.decorateSelf()
                class M extends Metadata {}
            } catch (error) {
                errorMsg = error.message;
            }
            expect(errorMsg).toBe('CO10014：元数据类 M 创建了不止一个装饰器，每个元数据类只能创建一个对应的装饰器。');
        });

        test('2个占位的装饰器，相互装饰，也不会报错', () => {
            const d1 = createPlaceholderDecoratorExp();
            const d2 = createPlaceholderDecoratorExp();

            @id('M')
            @d1.decorateSelf()
            @d2()
            @target([Target.Type.Class])
            class M extends Metadata {}

            @id('M2')
            @d2.decorateSelf()
            @d1()
            @target([Target.Type.Class])
            class M2 extends Metadata {}

            application.start();
        });
    });
});
