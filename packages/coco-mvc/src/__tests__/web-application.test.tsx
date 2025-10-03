describe('@webApplication', () => {
  let cocoMvc;
  let Application;
  let application;
  let view;
  let component;
  let scope;
  let SCOPE;
  let webApplication;
  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    view = cocoMvc.view;
    component = cocoMvc.component;
    scope = cocoMvc.scope;
    SCOPE = cocoMvc.SCOPE;
    webApplication = cocoMvc.webApplication;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('通过对象传入要注册的ioc组件，默认singleton模式', () => {
    class Theme {}
    @webApplication()
    class Application {
      @component()
      theme(): Theme {
        return new Theme();
      }
    }

    application.start();
    const t1 = application.getComponent(Theme);
    const t2 = application.getComponent(Theme);
    expect(t1).toBe(t2);
  });

  test('通过对象传入要注册的ioc组件，可以设置prototype模式', () => {
    class Button {}
    @webApplication()
    class Application {
      @scope(SCOPE.Prototype)
      @component()
      button(): Button {
        return new Button();
      }
    }
    application.start();
    const b1 = application.getComponent(Button);
    const b2 = application.getComponent(Button);
    expect(b1).not.toBe(b2);
  });
});
