describe('create-decorator-exp:createDecoratorExpFactory', () => {
    let cocoMvc;
    let createDecoratorExpFactory;
    let KindClass;
    let KindField;
    let KindMethod;
    let Application;
    let application;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        createDecoratorExpFactory = cocoMvc.createDecoratorExpFactory;
        KindClass = cocoMvc.KindClass;
        KindField = cocoMvc.KindField;
        KindMethod = cocoMvc.KindMethod;
        application = new Application();
        cocoMvc.registerMvcApi(application);
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
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
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(false, A, {
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
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(false, A, {
            metadataClass: Meta1,
            metadataKind: KindClass,
            metadataParam: param,
        });
        // 多次实例化操作
        new A();
        expect(fn).toHaveBeenCalledTimes(1);
        new A();
        expect(fn).toHaveBeenCalledTimes(1);
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
        expect(fn).toHaveBeenCalledTimes(0);
        new A();
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(false, A, {
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
        expect(fn).toHaveBeenCalledTimes(0);
        new A();
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(false, A, {
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
        expect(fn).toHaveBeenCalledTimes(0);
        new A();
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(false, A, {
            metadataClass: Meta4,
            metadataKind: KindField,
            metadataParam: param,
            field: 'f',
        });
        new A();
        expect(fn).toHaveBeenCalledTimes(1);
        new A();
        expect(fn).toHaveBeenCalledTimes(1);
        new A();
        expect(fn).toHaveBeenCalledTimes(1);
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
        expect(fn).toHaveBeenCalledTimes(0);
        new A();
        expect(fn).toHaveBeenCalledTimes(1);
        expect(fn).toHaveBeenCalledWith(false, A, {
            metadataClass: Meta5,
            metadataKind: KindMethod,
            metadataParam: param,
            field: 'fn',
        });
        new A();
        expect(fn).toHaveBeenCalledTimes(1);
        new A();
        expect(fn).toHaveBeenCalledTimes(1);
        new A();
        expect(fn).toHaveBeenCalledTimes(1);
    });

    test('不能装饰getter', () => {
        let errorMsg = '';
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
            errorMsg = e.message;
        }
        expect(errorMsg).toBe('CO10019：框架暂不支持为 getter 添加装饰器。');
    });

    test('不能装饰setter', () => {
        let errorMsg = '';
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
            errorMsg = e.message;
        }
        expect(errorMsg).toBe('CO10019：框架暂不支持为 setter 添加装饰器。');
    });

    test('不能装饰accesscor', () => {
        let errorMsg = '';
        try {
            const fn = jest.fn();
            const create = createDecoratorExpFactory(fn);

            class Meta8 {}
            const m = create(false, Meta8);

            class A {
                @m()
                accessor a = 22;
            }
        } catch (e) {
            errorMsg = e.message;
        }
        expect(errorMsg).toBe('CO10019：框架暂不支持为 accessor 添加装饰器。');
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

    test('和createPlaceholderDecoratorExp使用同一个元数据类创建装饰器，会报错', () => {
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

    test('createDecoratorExp第一个参数也不能是Metadata的后代类', () => {
        let errorMsg = '';
        try {
            class Sub extends Metadata {}
            class A extends Sub {}
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
});

describe('create-decorator-exp:createPlaceholderDecoratorExp', () => {
    let cocoMvc;
    let Metadata;
    let createPlaceholderDecoratorExp;
    let Application;
    let application;
    let target;
    let Target;
    let id;
    let consoleWarnSpy;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        Metadata = cocoMvc.Metadata;
        createPlaceholderDecoratorExp = cocoMvc.createPlaceholderDecoratorExp;
        target = cocoMvc.target;
        Target = cocoMvc.Target;
        id = cocoMvc.id;
        Application = cocoMvc.Application;
        application = new Application();
        cocoMvc.registerMvcApi(application);
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
        jest.resetModules();
        consoleWarnSpy.mockRestore();
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

    test('使用了placeholder装饰器，但是装饰器本身没有调用decorateSelf函数，直接报错', () => {
        let errorMsg = '';
        const d = createPlaceholderDecoratorExp();
        @d()
        class M extends Metadata {}

        try {
            application.start();
        } catch (error) {
            errorMsg = error.message;
        }
        expect(errorMsg).toBe('CO10021：M 类存在一个占位装饰器，但是没有使用decorateSelf装饰器关联真正的元数据类。');
    });

    test('没有使用placeholder装饰器，但是装饰器本身也没有调用decorateSelf函数，需要打印警告信息', () => {
        const d = createPlaceholderDecoratorExp();

        application.start();
        expect(consoleWarnSpy).toHaveBeenCalledWith(
            'CO10020：有一个占位装饰器没有使用decorateSelf关联具体的元数据类，如果不使用的话，直接删除这个装饰器。'
        );
    });
});
