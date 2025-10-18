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
    let addClassKindMetadata;
    let getAllMetadata;
    let Metadata;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        addClassKindMetadata = cocoMvc.addClassKindMetadata;
        getAllMetadata = cocoMvc.getAllMetadata;
        Metadata = cocoMvc.Metadata;
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        jest.resetModules();
    });

    test('为Metadata子类添加元数据', () => {
        class MM extends Metadata {}
        class B {}
        addClassKindMetadata(MM, B, {});
        const [metadataSet, bizSet] = getAllMetadata();
        expect(metadataSet.size).toStrictEqual(1);
    });

    test('为普通类添加元数据', () => {
        class M {}
        class B {}
        addClassKindMetadata(M, B, {});
        const [metadataSet, bizSet] = getAllMetadata();
        expect(bizSet.size).toStrictEqual(1);
    });
});

describe('addFieldOrMethodMetadata', () => {
    let cocoMvc;
    let addFieldKindMetadata;
    let getAllMetadata;
    let Metadata;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        addFieldKindMetadata = cocoMvc.addFieldKindMetadata;
        getAllMetadata = cocoMvc.getAllMetadata;
        Metadata = cocoMvc.Metadata;
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        jest.resetModules();
    });

    test('给Metadata子类添加field元数据会报错', () => {
        class MM extends Metadata {}
        class B {}
        let error = false;
        try {
            addFieldKindMetadata(MM, 'f', B, {});
        } catch (err) {
            error = true;
        }
        expect(error).toBeTruthy();
    });

    test('为普通类添加field元数据', () => {
        class M {}
        class B {}
        addFieldKindMetadata(M, 'f', B, {});
        const [metadataSet, bizSet] = getAllMetadata();
        expect(bizSet.size).toStrictEqual(1);
    });
});

describe('listClassKindMetadata', () => {
    let cocoMvc;
    let addClassKindMetadata;
    let listClassKindMetadata;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        addClassKindMetadata = cocoMvc.addClassKindMetadata;
        listClassKindMetadata = cocoMvc.listClassKindMetadata;
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        jest.resetModules();
    });
    test('listClassKindMetadata', () => {
        class T {}
        class M {}
        class M1 {}
        addClassKindMetadata(T, M, {});
        addClassKindMetadata(T, M1, {});
        const arr = listClassKindMetadata(T);
        expect(arr.length).toStrictEqual(2);
        const arr1 = listClassKindMetadata(T, M);
        expect(arr1.length).toStrictEqual(1);
        expect(arr1[0]).toBeInstanceOf(M);
    });
});

describe('ioc-container/metadata', () => {
    let cocoMvc;
    let addFieldKindMetadata;
    let listFieldKindMetadata;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        addFieldKindMetadata = cocoMvc.addFieldKindMetadata;
        listFieldKindMetadata = cocoMvc.listFieldKindMetadata;
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        jest.resetModules();
    });

    test('listFieldKindMetadata', () => {
        class T {}
        class M {}
        class M1 {}
        addFieldKindMetadata(T, 'a', M, {});
        addFieldKindMetadata(T, 'a', M1, {});
        const metadata = listFieldKindMetadata(T, 'a');
        expect(metadata.length).toStrictEqual(2);
        const metadata1 = listFieldKindMetadata(T, 'a', M);
        expect(metadata1.length).toStrictEqual(1);
        expect(metadata1[0]).toBeInstanceOf(M);
    });
});

describe('findClassKindMetadataRecursively', () => {
    let cocoMvc;
    let addClassKindMetadata;
    let findClassKindMetadataRecursively;
    let Metadata;
    let createDecoratorExp;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        addClassKindMetadata = cocoMvc.addClassKindMetadata;
        findClassKindMetadataRecursively = cocoMvc.findClassKindMetadataRecursively;
        Metadata = cocoMvc.Metadata;
        createDecoratorExp = cocoMvc.createDecoratorExp;
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        jest.resetModules();
    });

    test('可以找到直接注解对应的元数据', () => {
        class T {}
        class M {}
        addClassKindMetadata(T, M, {});
        const m = findClassKindMetadataRecursively(T, M);
        expect(m).toBeInstanceOf(M);
    });

    test('可以找到直接注解对应的元数据的注解的元数据', () => {
        class T {}
        class Parent extends Metadata {}
        const p = createDecoratorExp(Parent);

        @p()
        class Child {}
        addClassKindMetadata(T, Child, {});
        addClassKindMetadata(Child, Parent, {});
        let m = findClassKindMetadataRecursively(T, Parent);
        expect(m).toBe(null);
        m = findClassKindMetadataRecursively(T, Parent, 1);
        expect(m).toBeInstanceOf(Parent);
    });
});

describe('listBeDecoratedClsByClassKindMetadata', () => {
    let cocoMvc;
    let addClassKindMetadata;
    let listBeDecoratedClsByClassKindMetadata;
    let Metadata;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        addClassKindMetadata = cocoMvc.addClassKindMetadata;
        listBeDecoratedClsByClassKindMetadata = cocoMvc.listBeDecoratedClsByClassKindMetadata;
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
        addClassKindMetadata(T, M, {});
        addClassKindMetadata(T1, M, {});
        const m = listBeDecoratedClsByClassKindMetadata(M);
        expect(m.size).toBe(1);
        expect(m.has(T)).toBe(true);
    });
});
