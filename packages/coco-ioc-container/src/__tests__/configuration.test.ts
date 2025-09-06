describe('configuration装饰器', () => {
  let Application;
  let application;
  let configuration;
  let cocoMvc;
  let component;
  let Component;
  let consoleErrorSpy;
  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {});
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
    consoleErrorSpy.mockRestore();
  });

  test('field和method都不能使用configuration装饰器', () => {
    @component()
    class Button {
      @configuration()
      field: string;

      @configuration()
      click() {
        console.log('click');
      }
    }

    application.start();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
      'Button',
      'field',
      '@configuration',
      'class'
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
      'Button',
      'click',
      '@configuration',
      'class'
    );
  });

  test('通过对象传入要注册的ioc组件，默认singleton模式', () => {
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

  test('通过对象传入要注册的ioc组件，可以设置prototype模式', () => {
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
