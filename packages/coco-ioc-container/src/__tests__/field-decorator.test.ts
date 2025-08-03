let cocoMvc;
let Application;
let application;
let component;
let Metadata;

describe('field装饰器', () => {
  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    Metadata = cocoMvc.Metadata;
    component = cocoMvc.component;
    application = new Application();
    cocoMvc.registerApplication(application);
  });

  afterEach(async () => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('多个装饰器执行顺序', async () => {
    class A extends Metadata {}
    const a = cocoMvc.createDecoratorExp(A);
    const nameA = 'a';
    class B extends Metadata {}
    const b = cocoMvc.createDecoratorExp(B);
    const nameB = 'b';

    @component()
    class Button {
      @a()
      @b()
      count;
    }
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
