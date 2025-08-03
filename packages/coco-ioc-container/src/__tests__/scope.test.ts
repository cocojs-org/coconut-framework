let cocoMvc;
let Application;
let application;
let component;
let Component;
let Metadata;
describe('decorator', () => {
  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    Metadata = cocoMvc.Metadata;
    component = cocoMvc.component;
    Component = cocoMvc.Component;
    application = new Application();
    cocoMvc.registerApplication(application);
  });

  afterEach(async () => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('默认singleton模式', async () => {
    @component()
    class DefaultValue {}
    application.start();
    const s1 = application.getComponent(DefaultValue);
    const s2 = application.getComponent(DefaultValue);
    expect(s1 === s2).toBe(true);
  });

  test('支持显式singleton', async () => {
    @component(Component.Scope.Singleton)
    class Single {}
    application.start();
    const s1 = application.getComponent(Single);
    const s2 = application.getComponent(Single);
    expect(s1 === s2).toBe(true);
  });

  test('支持设置prototype', async () => {
    @component(Component.Scope.Prototype)
    class Prototype {}
    application.start();
    const p1 = application.getComponent(Prototype);
    const p2 = application.getComponent(Prototype);
    expect(p1 === p2).toBe(false);
  });
});
