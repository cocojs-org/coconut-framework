describe('metadata/create-metadata', () => {
    let cocoMvc;
    let instantiateMetadata;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        instantiateMetadata = cocoMvc.instantiateMetadata;
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        jest.resetModules();
    });

    test('纯对象类型会取自身的prop，全部浅赋值，不管元数据如何定义', () => {
        class M {
            name: string;
            age: number;
        }
        const hobbies = ['跑步', '爬山', 99];
        const m = instantiateMetadata(M, { name: '张三', hobbies });
        expect(m).toBeInstanceOf(M);
        expect(m['name']).toBe('张三');
        expect(m['age']).toBe(undefined);
        expect(m['hobbies']).toBe(hobbies);
    });

    test('非纯对象都赋到对象的value属性上', () => {
        class M {}
        const m1 = instantiateMetadata(M, '张三');
        expect(m1).toBeInstanceOf(M);
        expect(m1['value']).toBe('张三');
        const m2 = instantiateMetadata(M, '22');
        expect(m2).toBeInstanceOf(M);
        expect(m2['value']).toBe('22');
        const arr = [1, 2];
        const m3 = instantiateMetadata(M, arr);
        expect(m3).toBeInstanceOf(M);
        expect(m3['value']).toBe(arr);
        const m4 = instantiateMetadata(M, false);
        expect(m4).toBeInstanceOf(M);
        expect(m4['value']).toBe(false);
    });

    test('元数据类型定义了field，且有默认值，非纯对象都会复制给这个field', () => {
        class M {
            name = '张三';
        }
        const m = instantiateMetadata(M, '李四');
        expect(m).toBeInstanceOf(M);
        expect(m['name']).toBe('李四');
    });

    test('元数据类型定义了field，默认值使用undefined，非纯对象都会复制给这个field', () => {
        class M {
            name = undefined;
        }
        const m = instantiateMetadata(M, '李四');
        expect(m).toBeInstanceOf(M);
        expect(m['name']).toBe('李四');
    });

    test('元数据类型定义了field，但没有默认值，非纯对象都会复制给value', () => {
        class M {
            name: string;
        }
        const m = instantiateMetadata(M, '李四');
        expect(m).toBeInstanceOf(M);
        const m1 = new M();
        expect(m['name']).toBe(undefined);
        expect(m['value']).toBe('李四');
    });

    test('非纯对象都赋到元数据类型有默认值的field上', () => {
        class M {
            v = undefined;
        }
        const m = instantiateMetadata(M, '张三');
        expect(m).toBeInstanceOf(M);
        const m1 = new M();
        expect(m['v']).toBe('张三');
    });
});

describe('addClassKindMetadata', () => {
    let cocoMvc;
    let MetadataRepository;
    let metadataRepository;
    let Metadata;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        MetadataRepository = cocoMvc.MetadataRepository;
        metadataRepository = new MetadataRepository(new Map());
        Metadata = cocoMvc.Metadata;
    });
    afterEach(() => {
        metadataRepository.destructor();
        cocoMvc.cleanCache();
        jest.resetModules();
    });

    test('为Metadata子类添加元数据', () => {
        class MM extends Metadata {}
        class B {}
        metadataRepository.addClassKindMetadata(MM, B, {});
        const [metadataSet, bizSet] = metadataRepository.getAll();
        expect(metadataSet.size).toStrictEqual(1);
    });

    test('为普通类添加元数据', () => {
        class M {}
        class B {}
        metadataRepository.addClassKindMetadata(M, B, {});
        const [metadataSet, bizSet] = metadataRepository.getAll();
        expect(bizSet.size).toStrictEqual(1);
    });
});

describe('addFieldOrMethodMetadata', () => {
    let cocoMvc;
    let MetadataRepository;
    let metadataRepository;
    let Metadata;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        MetadataRepository = cocoMvc.MetadataRepository;
        metadataRepository = new MetadataRepository(new Map());
        Metadata = cocoMvc.Metadata;
    });
    afterEach(() => {
        metadataRepository.destructor();
        cocoMvc.cleanCache();
        jest.resetModules();
    });

    test('为普通类添加field元数据', () => {
        class M {}
        class B {}
        metadataRepository.addFieldKindMetadata(M, 'f', B, {});
        const [metadataSet, bizSet] = metadataRepository.getAll();
        expect(bizSet.size).toStrictEqual(1);
    });
});

describe('listClassKindMetadata', () => {
    let cocoMvc;
    let MetadataRepository;
    let metadataRepository;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        MetadataRepository = cocoMvc.MetadataRepository;
        metadataRepository = new MetadataRepository(new Map());
    });
    afterEach(() => {
        metadataRepository.destructor();
        cocoMvc.cleanCache();
        jest.resetModules();
    });
    test('listClassKindMetadata', () => {
        class T {}
        class M {}
        class M1 {}
        metadataRepository.addClassKindMetadata(T, M, {});
        metadataRepository.addClassKindMetadata(T, M1, {});
        const arr = metadataRepository.listClassKindMetadata(T);
        expect(arr.length).toStrictEqual(2);
        const arr1 = metadataRepository.listClassKindMetadata(T, M);
        expect(arr1.length).toStrictEqual(1);
        expect(arr1[0]).toBeInstanceOf(M);
    });
});

describe('listFieldKindMetadata', () => {
    let cocoMvc;
    let MetadataRepository;
    let metadataRepository;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        MetadataRepository = cocoMvc.MetadataRepository;
        metadataRepository = new MetadataRepository(new Map());
    });
    afterEach(() => {
        metadataRepository.destructor();
        cocoMvc.cleanCache();
        jest.resetModules();
    });

    test('listFieldKindMetadata', () => {
        class T {}
        class M {}
        class M1 {}
        metadataRepository.addFieldKindMetadata(T, 'a', M, {});
        metadataRepository.addFieldKindMetadata(T, 'a', M1, {});
        const metadata = metadataRepository.listFieldKindMetadata(T, 'a');
        expect(metadata.length).toStrictEqual(2);
        const metadata1 = metadataRepository.listFieldKindMetadata(T, 'a', M);
        expect(metadata1.length).toStrictEqual(1);
        expect(metadata1[0]).toBeInstanceOf(M);
    });
});

describe('findClassKindMetadataRecursively', () => {
    let cocoMvc;
    let MetadataRepository;
    let metadataRepository;
    let Metadata;
    let createDecoratorExp;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        MetadataRepository = cocoMvc.MetadataRepository;
        Metadata = cocoMvc.Metadata;
        createDecoratorExp = cocoMvc.createDecoratorExp;
        metadataRepository = new MetadataRepository(new Map());
    });
    afterEach(() => {
        metadataRepository.destructor();
        cocoMvc.cleanCache();
        jest.resetModules();
    });

    test('可以找到直接注解对应的元数据', () => {
        class T {}
        class M {}
        metadataRepository.addClassKindMetadata(T, M, {});
        const m = metadataRepository.findClassKindMetadataRecursively(T, M);
        expect(m).toBeInstanceOf(M);
    });

    test('可以找到直接注解对应的元数据的注解的元数据', () => {
        class T {}
        class Parent extends Metadata {}
        const p = createDecoratorExp(Parent);

        @p()
        class Child {}
        metadataRepository.addClassKindMetadata(T, Child, {});
        metadataRepository.addClassKindMetadata(Child, Parent, {});
        let m = metadataRepository.findClassKindMetadataRecursively(T, Parent);
        expect(m).toBe(null);
        m = metadataRepository.findClassKindMetadataRecursively(T, Parent, 1);
        expect(m).toBeInstanceOf(Parent);
    });
});

describe('listBeDecoratedClsByClassKindMetadata', () => {
    let cocoMvc;
    let MetadataRepository;
    let metadataRepository;
    let Metadata;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        MetadataRepository = cocoMvc.MetadataRepository;
        metadataRepository = new MetadataRepository(new Map());
        Metadata = cocoMvc.Metadata;
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        jest.resetModules();
    });

    test('只会找业务类的类元数据', () => {
        class T {}
        class T1 extends Metadata {}
        class M {}
        metadataRepository.addClassKindMetadata(T, M, {});
        metadataRepository.addClassKindMetadata(T1, M, {});
        const m = metadataRepository.listBeDecoratedClsByClassKindMetadata(M);
        expect(m.size).toBe(1);
        expect(m.has(T)).toBe(true);
    });
});

describe('validate', () => {
    let cocoMvc;
    let MetadataRepository;
    let metadataRepository;
    let Metadata;
    let Target;
    let target;
    let component;
    let reactive;
    let bind;
    let id;
    let Application;
    let application;
    let createDecoratorExp;
    let createPlaceholderDecoratorExp;
    let consoleErrorSpy;
    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        MetadataRepository = cocoMvc.MetadataRepository;
        metadataRepository = new MetadataRepository(new Map());
        Metadata = cocoMvc.Metadata;
        Target = cocoMvc.Target;
        component = cocoMvc.component;
        reactive = cocoMvc.reactive;
        bind = cocoMvc.bind;
        id = cocoMvc.id;
        target = cocoMvc.target;
        createDecoratorExp = cocoMvc.createDecoratorExp;
        createPlaceholderDecoratorExp = cocoMvc.createPlaceholderDecoratorExp;
        Application = cocoMvc.Application;
        application = new Application();
        cocoMvc.registerMvcApi(application);
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
    });
    afterEach(() => {
        jest.resetModules();
        consoleErrorSpy.mockRestore();
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
    });

    test('元数据类如果添加了字段装饰器，会报错', () => {
        @id('T1')
        @target([Target.Type.Class])
        @component()
        class T1 extends Metadata {
            @reactive()
            name: string;

            @reactive()
            age: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10022：元数据类 %s 只能有 KindClass 类型的装饰器，字段 %s 上的装饰器是无效的，请删除。',
            'T1',
            'name,age'
        );
    });

    test('元数据类如果添加了方法装饰器，会报错', () => {
        @id('T1')
        @target([Target.Type.Class])
        @component()
        class T1 extends Metadata {
            @bind()
            getAge() {
                return '18';
            }

            @bind()
            getName() {
                return '张三';
            }
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10023：元数据类 %s 只能有 KindClass 类型的装饰器，方法 %s 上的装饰器是无效的，请删除。',
            'T1',
            'getAge,getName'
        );
    });

    test('元数据类上添加 2 个相同的类装饰器，会提醒重复装饰器', () => {
        @component()
        @component()
        @target([Target.Type.Class])
        class T1 extends Metadata {}
        const t1 = createDecoratorExp(T1);

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10003：在一个类上不能添加多次同一个装饰器，但%s上存在重复装饰器: %s',
            'T1',
            '@component'
        );
    });

    test('元数据类如果添加了大于1个不同的类装饰器时，元数据类就不是组件元数据类，对应的装饰器就不是组件装饰器', () => {
        @component()
        @target([Target.Type.Class])
        class T1 extends Metadata {}
        const t1 = createDecoratorExp(T1);

        @t1()
        @component()
        @target([Target.Type.Class])
        class Log extends Metadata {}
        const log = createDecoratorExp(Log);

        @log()
        @target([Target.Type.Class])
        class NotComponent extends Metadata {}

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10024：元数据类 %s 存在多个组件装饰器 %s，一个元数据类最多只能有一个组件装饰器。',
            'Log',
            '@component, @t1'
        );
        expect(application.componentMetadataClass.isComponentMetadata(Log)).toBe(false);
        expect(application.componentMetadataClass.isComponentMetadata(NotComponent)).toBe(false);
    });

    test('元数据类如果添加了大于1个不同的类装饰器时，元数据类就不是组件元数据类，对应的装饰器就不是组件装饰器', () => {
        const t1 = createPlaceholderDecoratorExp();
        const log = createPlaceholderDecoratorExp();

        @component()
        @target([Target.Type.Class])
        @t1.decorateSelf()
        class T1 extends Metadata {}

        @t1()
        @component()
        @target([Target.Type.Class])
        @log.decorateSelf()
        class Log extends Metadata {}

        @log()
        @target([Target.Type.Class])
        class NotComponent extends Metadata {}

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10024：元数据类 %s 存在多个组件装饰器 %s，一个元数据类最多只能有一个组件装饰器。',
            'Log',
            '@component, @t1'
        );
        expect(application.componentMetadataClass.isComponentMetadata(Log)).toBe(false);
        expect(application.componentMetadataClass.isComponentMetadata(NotComponent)).toBe(false);
    });

    test('元数据类如果添加了大于 1 个组件装饰器，但是刚好只有一个组件装饰器是合法的，则元数据类是组件元数据类，对应的装饰器还是组件装饰器', () => {
        @component()
        @target([Target.Type.Class])
        class T1 extends Metadata {}
        const t1 = createDecoratorExp(T1);

        @t1()
        @component()
        @target([Target.Type.Class])
        class Log extends Metadata {}
        const log = createDecoratorExp(Log);

        // 虽然IsComponent有 2 个类装饰器，但是@log不是合法的，所以IsComponent是组件元数据类
        @log()
        @component()
        @target([Target.Type.Class])
        class OneComponent extends Metadata {}
        const oneComponent = createDecoratorExp(OneComponent);

        @oneComponent()
        @target([Target.Type.Class])
        class IsComponent extends Metadata {}

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10024：元数据类 %s 存在多个组件装饰器 %s，一个元数据类最多只能有一个组件装饰器。',
            'Log',
            '@component, @t1'
        );
        expect(application.componentMetadataClass.isComponentMetadata(OneComponent)).toBe(true);
        expect(application.componentMetadataClass.isComponentMetadata(IsComponent)).toBe(true);
    });

    test('元数据类如果添加了大于 1 个组件装饰器，但是刚好只有一个组件装饰器是合法的，则元数据类是组件元数据类，对应的装饰器还是组件装饰器', () => {
        const t1 = createPlaceholderDecoratorExp();
        const log = createPlaceholderDecoratorExp();
        const oneComponent = createPlaceholderDecoratorExp();
        @component()
        @target([Target.Type.Class])
        @t1.decorateSelf()
        class T1 extends Metadata {}

        @t1()
        @component()
        @target([Target.Type.Class])
        @log.decorateSelf()
        class Log extends Metadata {}

        // 虽然IsComponent有 2 个类装饰器，但是@log不是合法的，所以IsComponent是组件元数据类
        @log()
        @component()
        @target([Target.Type.Class])
        @oneComponent.decorateSelf()
        class OneComponent extends Metadata {}

        @oneComponent()
        @target([Target.Type.Class])
        class IsComponent extends Metadata {}

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10024：元数据类 %s 存在多个组件装饰器 %s，一个元数据类最多只能有一个组件装饰器。',
            'Log',
            '@component, @t1'
        );
        expect(application.componentMetadataClass.isComponentMetadata(OneComponent)).toBe(true);
        expect(application.componentMetadataClass.isComponentMetadata(IsComponent)).toBe(true);
    });

    test('2个组件装饰器出现了循环依赖，那么路径上的所有组件装饰器都不是组件元数据类', () => {
        const t1 = createPlaceholderDecoratorExp();
        const t2 = createPlaceholderDecoratorExp();
        @component()
        @t1.decorateSelf()
        @t2()
        @target([Target.Type.Class])
        class T1 extends Metadata {}

        @t1()
        @t2.decorateSelf()
        @target([Target.Type.Class])
        class T2 extends Metadata {}

        application.start();
        expect(application.componentMetadataClass.isComponentMetadata(T1)).toBe(false);
        expect(application.componentMetadataClass.isComponentMetadata(T2)).toBe(false);
    });
});
