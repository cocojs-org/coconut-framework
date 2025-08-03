let cocoMvc;
let Application;
let application;
let component;
let Component;
let Target;
describe('decorator', () => {
  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    component = cocoMvc.component;
    Component = cocoMvc.Component;
    Target = cocoMvc.Target;
    application = new Application();
    cocoMvc.registerApplication(application);
  });

  afterEach(async () => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('组件类的元数据正确', async () => {
    @component(Component.Scope.Singleton)
    class Button {}

    application.start();
    const asExpected =
      cocoMvc._test_helper.iocContainer.checkClassMetadataAsExpected(Button, [
        {
          Metadata: Component,
          fieldValues: { scope: Component.Scope.Singleton },
        },
      ]);
    expect(asExpected).toBe(true);
    const r1 = cocoMvc._test_helper.iocContainer.checkClassMetadataAsExpected(
      Target,
      [
        {
          Metadata: Target,
          fieldValues: { value: [Target.Type.Class] },
        },
      ]
    );
    expect(r1).toEqual(true);
    const r2 = cocoMvc._test_helper.iocContainer.checkClassMetadataAsExpected(
      Component,
      [
        {
          Metadata: Target,
          fieldValues: { value: [Target.Type.Class, Target.Type.Method] },
        },
      ]
    );
    expect(r2).toEqual(true);
  });
});
