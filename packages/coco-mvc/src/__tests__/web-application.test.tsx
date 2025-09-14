describe('@webApplication', () => {
  let cocoMvc;
  let Application;
  let application;
  let view;
  let component;
  let Component;
  let webApplication;
  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    view = cocoMvc.view;
    component = cocoMvc.component;
    Component = cocoMvc.Component;
    webApplication = cocoMvc.webApplication;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  xtest('通过对象传入要注册的ioc组件，默认singleton模式', async () => {
    // TODO: component装饰器要重新实现
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

  xtest('通过对象传入要注册的ioc组件，可以设置prototype模式', async () => {
    // TODO: component装饰器要重新实现
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
