describe('@webApplication', () => {
  let cocoMvc,
    Application,
    application,
    view,
    component,
    Component,
    webApplication;
  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = (await import('coco-mvc')).Application;
    view = (await import('coco-mvc')).view;
    bind = (await import('coco-mvc')).bind;
    component = (await import('coco-mvc')).component;
    Component = (await import('coco-mvc')).Component;
    webApplication = (await import('coco-mvc')).webApplication;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('通过对象传入要注册的ioc组件，默认singleton模式', async () => {
    class Theme {}
    @webApplication()
    class Application {
      @component()
      theme() {
        return new Theme();
      }
    }

    application.start();
    const t1 = application.getComponent(Theme);
    const t2 = application.getComponent(Theme);
    expect(t1).toBe(t2);
  });

  test('通过对象传入要注册的ioc组件，可以设置prototype模式', async () => {
    class Button {}
    @webApplication()
    class Application {
      @component(Component.Scope.Prototype)
      button() {
        return new Button();
      }
    }
    application.start();
    const b1 = application.getComponent(Button);
    const b2 = application.getComponent(Button);
    expect(b1).not.toBe(b2);
  });
});
