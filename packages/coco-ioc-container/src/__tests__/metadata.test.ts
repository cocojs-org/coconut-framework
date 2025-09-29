import {
  addClassMetadata,
  addFieldMetadata,
  addMethodMetadata,
  clear,
  findClassMetadata,
  getAllMetadata,
  listBeDecoratedClsByClassMetadata,
  listBeDecoratedClsByFieldMetadata,
  listClassMetadata,
  listFieldMetadata,
} from '../metadata/index.ts';
import Metadata, { createMetadata } from '../metadata/create-metadata.ts';
import {
  createDecoratorExp,
  Decorator,
} from '../ioc-container/create-decorator-exp.ts';

// TODO: 不要基于源文件做测试，而是基于打包后的包做测试
describe('metadata/create-metadata', () => {
  test('纯对象类型会取自身的prop，全部浅赋值，不管元数据如何定义', () => {
    class M {
      name: string;
      age: number;
    }
    const hobbies = ['跑步', '爬山', 99];
    const m = createMetadata(M, { name: '张三', hobbies });
    expect(m).toBeInstanceOf(M);
    expect(m['name']).toBe('张三');
    expect(m['age']).toBe(undefined);
    expect(m['hobbies']).toBe(hobbies);
  });
  test('非纯对象都赋到对象的value属性上', () => {
    class M {}
    const m1 = createMetadata(M, '张三');
    expect(m1).toBeInstanceOf(M);
    expect(m1['value']).toBe('张三');
    const m2 = createMetadata(M, '22');
    expect(m2).toBeInstanceOf(M);
    expect(m2['value']).toBe('22');
    const arr = [1, 2];
    const m3 = createMetadata(M, arr);
    expect(m3).toBeInstanceOf(M);
    expect(m3['value']).toBe(arr);
    const m4 = createMetadata(M, false);
    expect(m4).toBeInstanceOf(M);
    expect(m4['value']).toBe(false);
  });

  test('元数据类型定义了field，且有默认值，非纯对象都会复制给这个field', () => {
    class M {
      name = '张三';
    }
    const m = createMetadata(M, '李四');
    expect(m).toBeInstanceOf(M);
    expect(m['name']).toBe('李四');
  });

  test('元数据类型定义了field，默认值使用undefined，非纯对象都会复制给这个field', () => {
    class M {
      name = undefined;
    }
    const m = createMetadata(M, '李四');
    expect(m).toBeInstanceOf(M);
    expect(m['name']).toBe('李四');
  });

  test('元数据类型定义了field，但没有默认值，非纯对象都会复制给value', () => {
    class M {
      name: string;
    }
    const m = createMetadata(M, '李四');
    expect(m).toBeInstanceOf(M);
    const m1 = new M();
    expect(m['name']).toBe(undefined);
    expect(m['value']).toBe('李四');
  });

  test('非纯对象都赋到元数据类型有默认值的field上', () => {
    class M {
      v = undefined;
    }
    const m = createMetadata(M, '张三');
    expect(m).toBeInstanceOf(M);
    const m1 = new M();
    expect(m['v']).toBe('张三');
  });
});

describe('addClassMetadata', () => {
  beforeEach(async () => {});

  afterEach(async () => {
    clear();
    jest.resetModules();
  });

  test('为Metadata子类添加元数据', async () => {
    class MM extends Metadata {}
    class B {}
    addClassMetadata(MM, B, {});
    const [metadataSet, bizSet] = getAllMetadata();
    expect(metadataSet.size).toStrictEqual(1);
  });

  test('为普通类添加元数据', async () => {
    class M {}
    class B {}
    addClassMetadata(M, B, {});
    const [metadataSet, bizSet] = getAllMetadata();
    expect(bizSet.size).toStrictEqual(1);
  });
});

describe('addFieldOrMethodMetadata', () => {
  beforeEach(async () => {});

  afterEach(async () => {
    clear();
    jest.resetModules();
  });

  test('给Metadata子类添加field元数据会报错', async () => {
    class MM extends Metadata {}
    class B {}
    let error = false;
    try {
      addFieldMetadata(MM, 'f', B, {});
    } catch (err) {
      error = true;
    }
    expect(error).toBeTruthy();
  });

  test('为普通类添加field元数据', async () => {
    class M {}
    class B {}
    addFieldMetadata(M, 'f', B, {});
    const [metadataSet, bizSet] = getAllMetadata();
    expect(bizSet.size).toStrictEqual(1);
  });
});

describe('listClassMetadata', () => {
  test('listClassMetadata', async () => {
    class T {}
    class M {}
    class M1 {}
    addClassMetadata(T, M, {});
    addClassMetadata(T, M1, {});
    const arr = listClassMetadata(T);
    expect(arr.length).toStrictEqual(2);
    const arr1 = listClassMetadata(T, M);
    expect(arr1.length).toStrictEqual(1);
    expect(arr1[0]).toBeInstanceOf(M);
  });
});

describe('ioc-container/metadata', () => {
  test('listFieldMetadata', async () => {
    class T {}
    class M {}
    class M1 {}
    addFieldMetadata(T, 'a', M, {});
    addFieldMetadata(T, 'a', M1, {});
    const metadata = listFieldMetadata(T, 'a');
    expect(metadata.length).toStrictEqual(2);
    const metadata1 = listFieldMetadata(T, 'a', M);
    expect(metadata1.length).toStrictEqual(1);
    expect(metadata1[0]).toBeInstanceOf(M);
  });
});

describe('findClassMetadata', () => {
  beforeEach(async () => {});

  afterEach(async () => {
    clear();
    jest.resetModules();
  });

  test('可以找到直接注解对应的元数据', async () => {
    class T {}
    class M {}
    addClassMetadata(T, M, {});
    const m = findClassMetadata(T, M);
    expect(m).toBeInstanceOf(M);
  });

  test('可以找到直接注解对应的元数据的注解的元数据', async () => {
    class T {}
    class Parent extends Metadata {}
    const p: () => Decorator<ClassDecoratorContext> =
      createDecoratorExp(Parent);

    @p()
    class Child {}
    addClassMetadata(T, Child, {});
    addClassMetadata(Child, Parent, {});
    let m = findClassMetadata(T, Parent);
    expect(m).toBe(null);
    m = findClassMetadata(T, Parent, 1);
    expect(m).toBeInstanceOf(Parent);
  });
});

describe('listBeDecoratedClsByClassMetadata', () => {
  beforeEach(async () => {});

  afterEach(async () => {
    clear();
    jest.resetModules();
  });

  test('只会找业务类的类元数据', async () => {
    class T {}
    class T1 extends Metadata {}
    class M {}
    addClassMetadata(T, M, {});
    addClassMetadata(T1, M, {});
    const m = listBeDecoratedClsByClassMetadata(M);
    expect(m.size).toBe(1);
    expect(m.has(T)).toBe(true);
  });
});

describe('listBeDecoratedClsByFieldMetadata', () => {
  beforeEach(async () => {});

  afterEach(async () => {
    clear();
    jest.resetModules();
  });

  test('只会找业务类的类元数据', async () => {
    class T {}
    class M {}
    addFieldMetadata(T, 'f', M, {});
    const m = listBeDecoratedClsByFieldMetadata(M);
    expect(m.size).toBe(1);
    expect(m.has(T)).toBe(true);
  });
});
