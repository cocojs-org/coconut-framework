let Application;
let application;
let configuration;
let cocoMvc;
let component;
let Component;
describe('decorator', () => {
  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    component = cocoMvc.component;
    Component = cocoMvc.Component;
    configuration = cocoMvc.configuration;
    Application = cocoMvc.Application;
    application = new Application();
    cocoMvc.registerApplication(application);
  });

  afterEach(async () => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('通过对象传入要注册的ioc组件，默认singleton模式', async () => {
    class Theme {}

    @configuration()
    class WebAppConfiguration {
      @component()
      theme() {
        return new Theme();
      }
    }
    application.start();
    const t1 = application.getComponent(Theme);
    const t2 = application.getComponent(Theme);
    expect(t1 === t2).toBe(true);
  });

  test('通过对象传入要注册的ioc组件，可以设置prototype模式', async () => {
    class Button {}

    @configuration()
    class WebAppConfiguration {
      @component(Component.Scope.Prototype)
      button() {
        return new Button();
      }
    }

    application.start();
    const b1 = application.getComponent(Button);
    const b2 = application.getComponent(Button);
    expect(b1 === b2).toBe(false);
  });
});
