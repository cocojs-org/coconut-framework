import {
  createDecoratorExp,
  createDecoratorExpByName,
  createDecoratorExpFactory,
  type Decorator,
  KindClass,
  KindField,
  KindMethod,
} from '../create-decorator-exp';

describe('create-decorator-exp:createDecoratorExpFactory', () => {
  beforeEach(async () => {});

  afterEach(async () => {
    jest.resetModules();
  });

  test('类装饰器，不需要实例化就拿到装饰器参数', async () => {
    const fn = jest.fn();
    const create = createDecoratorExpFactory(fn);

    class Meta {}
    const m = create(Meta);
    const param = 22;
    @m(param)
    class A {}
    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith(A, {
      decoratorName: 'meta',
      metadataClass: Meta,
      metadataKind: KindClass,
      metadataParam: param,
    });
  });

  test('类装饰器，实例化多次但不会再次调用记录装饰器参数的回调', async () => {
    const fn = jest.fn();
    const createDE = createDecoratorExpFactory(fn);
    class Meta1 {}
    const m = createDE(Meta1);
    const param = 22;
    @m(param)
    class A {}
    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith(A, {
      decoratorName: 'meta1',
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

  test('filed装饰器，需要实例化一次拿到装饰器参数', async () => {
    const fn = jest.fn();
    const create = createDecoratorExpFactory(fn);

    class Meta2 {}
    const m = create(Meta2);
    const param = 22;
    class A {
      @m(param)
      f;
    }
    expect(fn).toBeCalledTimes(0);
    new A();
    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith(A, {
      decoratorName: 'meta2',
      metadataClass: Meta2,
      metadataKind: KindField,
      metadataParam: param,
      field: 'f',
    });
  });

  test('method装饰器，需要实例化一次拿到装饰器参数', async () => {
    const fn = jest.fn();
    const create = createDecoratorExpFactory(fn);

    class Meta3 {}
    const m = create(Meta3);
    const param = 22;
    class A {
      @m(param)
      fn() {}
    }
    expect(fn).toBeCalledTimes(0);
    new A();
    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith(A, {
      decoratorName: 'meta3',
      metadataClass: Meta3,
      metadataKind: KindMethod,
      metadataParam: param,
      field: 'fn',
    });
  });

  test('filed装饰器，只有第一次实例化会记录装饰器参数，后续实例化都不会', async () => {
    const fn = jest.fn();
    const create = createDecoratorExpFactory(fn);

    class Meta4 {}
    const m = create(Meta4);
    const param = 22;
    class A {
      @m(param)
      f;
    }
    expect(fn).toBeCalledTimes(0);
    new A();
    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith(A, {
      decoratorName: 'meta4',
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

  test('method装饰器，只有第一次实例化会记录装饰器参数，后续实例化都不会', async () => {
    const fn = jest.fn();
    const create = createDecoratorExpFactory(fn);

    class Meta5 {}
    const m = create(Meta5);
    const param = 22;
    class A {
      @m(param)
      fn() {}
    }
    expect(fn).toBeCalledTimes(0);
    new A();
    expect(fn).toBeCalledTimes(1);
    expect(fn).toBeCalledWith(A, {
      decoratorName: 'meta5',
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

  test('不能装饰getter', async () => {
    let shouldThrowError = false;
    try {
      const fn = jest.fn();
      const create = createDecoratorExpFactory(fn);

      class Meta6 {}
      const m: () => Decorator<ClassGetterDecoratorContext> = create(Meta6);

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

  test('不能装饰setter', async () => {
    let shouldThrowError = false;
    try {
      const fn = jest.fn();
      const create = createDecoratorExpFactory(fn);

      class Meta7 {}
      const m = create(Meta7);

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
  beforeEach(async () => {});

  afterEach(async () => {
    jest.resetModules();
  });

  test('createDecoratorExp第一个参数可以使用类', async () => {
    let shouldThrowError = false;
    try {
      class A {}
      createDecoratorExp(A);
    } catch (e) {
      shouldThrowError = true;
    }
    expect(shouldThrowError).toBe(false);
  });

  test('createDecoratorExp第一个参数不能使用数字', async () => {
    let shouldThrowError = false;
    try {
      // @ts-ignore
      createDecoratorExp(1);
    } catch (e) {
      shouldThrowError = true;
    }
    expect(shouldThrowError).toBe(true);
  });

  test('createDecoratorExp第一个参数不能使用字符串', async () => {
    let shouldThrowError = false;
    try {
      // @ts-ignore
      createDecoratorExp('abc');
    } catch (e) {
      shouldThrowError = true;
    }
    expect(shouldThrowError).toBe(true);
  });

  test('createDecoratorExp第一个参数不能使用对象', async () => {
    let shouldThrowError = false;
    try {
      // @ts-ignore
      createDecoratorExp({});
    } catch (e) {
      shouldThrowError = true;
    }
    expect(shouldThrowError).toBe(true);
  });

  test('createDecoratorExp第一个参数不能使用函数', async () => {
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

describe('create-decorator-exp:createDecoratorExpByName', () => {
  beforeEach(async () => {});

  afterEach(async () => {
    jest.resetModules();
  });

  test('createDecoratorExpByName第一个参数使用字符串', async () => {
    let shouldThrowError = false;
    try {
      createDecoratorExpByName('abc');
    } catch (e) {
      shouldThrowError = true;
    }
    expect(shouldThrowError).toBe(false);
  });

  test('createDecoratorExpByName第一个参数不能使用数字', async () => {
    let shouldThrowError = false;
    try {
      // @ts-ignore
      createDecoratorExpByName(1);
    } catch (e) {
      shouldThrowError = true;
    }
    expect(shouldThrowError).toBe(true);
  });

  test('createDecoratorExpByName第一个参数不能使用对象', async () => {
    let shouldThrowError = false;
    try {
      // @ts-ignore
      createDecoratorExpByName({});
    } catch (e) {
      shouldThrowError = true;
    }
    expect(shouldThrowError).toBe(true);
  });

  test('createDecoratorExpByName第一个参数不能使用函数', async () => {
    let shouldThrowError = false;
    try {
      // @ts-ignore
      createDecoratorExpByName(function () {});
    } catch (e) {
      shouldThrowError = true;
    }
    expect(shouldThrowError).toBe(true);
  });

  test('createDecoratorExpByName第一个参数不能使用类', async () => {
    let shouldThrowError = false;
    try {
      class A {}
      // @ts-ignore
      createDecoratorExpByName(A);
    } catch (e) {
      shouldThrowError = true;
    }
    expect(shouldThrowError).toBe(true);
  });
});
