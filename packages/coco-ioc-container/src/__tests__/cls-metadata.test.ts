describe('decorator', () => {
  let cocoMvc;
  let Application;
  let application;
  let component;
  let Component;
  let Target;
  let scope;
  let Scope;
  let SCOPE;

  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    component = cocoMvc.component;
    Component = cocoMvc.Component;
    Target = cocoMvc.Target;
    scope = cocoMvc.scope;
    Scope = cocoMvc.Scope;
    SCOPE = cocoMvc.SCOPE;
    application = new Application();
    cocoMvc.registerApplication(application);
  });

  afterEach(async () => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('组件类的元数据正确', () => {
    @scope(SCOPE.Singleton)
    @component()
    class Button {}

    application.start();
    const asExpected = cocoMvc.checkClassMetadataAsExpected(Button, [
      {
        Metadata: Component,
        fieldValues: {},
      },
      {
        Metadata: Scope,
        fieldValues: { value: SCOPE.Singleton },
      },
    ]);
    expect(asExpected).toBe(true);
    const r1 = cocoMvc.checkClassMetadataAsExpected(Target, [
      {
        Metadata: Target,
        fieldValues: { value: [Target.Type.Class] },
      },
    ]);
    expect(r1).toEqual(true);
    const r2 = cocoMvc.checkClassMetadataAsExpected(Component, [
      {
        Metadata: Target,
        fieldValues: { value: [Target.Type.Class, Target.Type.Method] },
      },
    ]);
    expect(r2).toEqual(true);
  });
});
