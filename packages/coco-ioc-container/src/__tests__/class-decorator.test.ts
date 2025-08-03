let cocoMvc;
let Application;
let application;
let Metadata;

describe('class装饰器', () => {
  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    Metadata = cocoMvc.Metadata;
    application = new Application();
    cocoMvc.registerApplication(application);
  });

  afterEach(async () => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('一个类的多个类装饰器执行顺序', async () => {
    class A extends Metadata {}
    const a = cocoMvc.createDecoratorExp(A);
    const nameA = 'a';
    class B extends Metadata {}
    const b = cocoMvc.createDecoratorExp(B);
    const nameB = 'b';

    @a()
    @b()
    class Button {}
    application.start();

    const isExpected = cocoMvc._test_helper.iocContainer.expectInOrder([
      { type: 'exec', name: nameA },
      { type: 'exec', name: nameB },
      { type: 'apply', name: nameB },
      { type: 'apply', name: nameA },
    ]);
    expect(isExpected).toEqual(true);
  });
});
