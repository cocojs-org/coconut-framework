import {
  addDecoratorParams,
  isIncludesClassDecorator,
  get,
  clear,
} from '../../ioc-container/decorator-params.ts';
import { KindClass } from '../../ioc-container/decorator-context.ts';
import { createDecoratorExpFactory } from '../../ioc-container/create-decorator-exp.ts';

describe('decorator-params', () => {
  beforeEach(async () => {});

  afterEach(async () => {
    clear();
    jest.resetModules();
  });

  test('如果不是装饰类，那么不会被收集到装饰器参数中', async () => {
    class A {}
    class Meta {}
    // @ts-ignore
    addDecoratorParams(1, {
      decoratorName: 'meta',
      metadataKind: KindClass,
      metadataClass: Meta,
      metadataParam: undefined,
    });
    // @ts-ignore
    addDecoratorParams('str', {
      decoratorName: 'meta',
      metadataKind: KindClass,
      metadataClass: Meta,
      metadataParam: undefined,
    });
    addDecoratorParams(
      // @ts-ignore
      {},
      {
        decoratorName: 'meta',
        metadataKind: KindClass,
        metadataClass: Meta,
        metadataParam: undefined,
      }
    );
    // @ts-ignore
    addDecoratorParams([], {
      decoratorName: 'meta',
      metadataKind: KindClass,
      metadataClass: Meta,
      metadataParam: undefined,
    });
    // @ts-ignore
    addDecoratorParams(() => {}, {
      decoratorName: 'meta',
      metadataKind: KindClass,
      metadataClass: Meta,
      metadataParam: undefined,
    });
    expect(get().size).toBe(0);
    addDecoratorParams(A, {
      decoratorName: 'meta',
      metadataKind: KindClass,
      metadataClass: Meta,
      metadataParam: undefined,
    });
    expect(get().size).toBe(1);
  });

  test('isIncludesClassDecorator默认只找当前类装饰器', async () => {
    const create = createDecoratorExpFactory(addDecoratorParams);

    class MetaMeta {}
    const dd = create(MetaMeta);

    @dd()
    class MetaA {}
    const d = create(MetaA);

    @d()
    class A {}
    const f1 = isIncludesClassDecorator(A, MetaA);
    expect(f1).toBe(true);
    const f2 = isIncludesClassDecorator(A, MetaMeta);
    expect(f2).toBe(false);
  });

  test('isIncludesClassDecorator通过设置查找装饰器对应的元数据的类装饰器', async () => {
    const create = createDecoratorExpFactory(addDecoratorParams);

    class MetaMetaMeta {}
    const ddd = create(MetaMetaMeta);

    @ddd()
    class MetaMetaA {}
    const dd = create(MetaMetaA);

    @dd()
    class Meta {}
    const d = create(Meta);

    @d()
    class A {}

    const f1 = isIncludesClassDecorator(A, Meta);
    expect(f1).toBe(true);
    const f2 = isIncludesClassDecorator(A, MetaMetaA);
    expect(f2).toBe(false);
    const f3 = isIncludesClassDecorator(A, MetaMetaA, 1);
    expect(f3).toBe(true);
    const f4 = isIncludesClassDecorator(A, MetaMetaMeta, 1);
    expect(f4).toBe(false);
    const f5 = isIncludesClassDecorator(A, MetaMetaMeta, 2);
    expect(f5).toBe(true);
  });
});
