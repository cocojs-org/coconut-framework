describe('configuration装饰器', () => {
  let Application;
  let application;
  let configuration;
  let Configuration;
  let cocoMvc;
  let component;
  let scope;
  let SCOPE;
  let getMetaClassById;
  let consoleErrorSpy;
  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {});
    cocoMvc = await import('coco-mvc');
    component = cocoMvc.component;
    scope = cocoMvc.scope;
    SCOPE = cocoMvc.SCOPE;
    configuration = cocoMvc.configuration;
    Configuration = cocoMvc.Configuration;
    Application = cocoMvc.Application;
    getMetaClassById = cocoMvc.getMetaClassById;
    application = new Application();
    cocoMvc.registerApplication(application, getMetaClassById);
  });

  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
    consoleErrorSpy.mockRestore();
  });

  test('支持通过id获取Configuration类', () => {
    application.start();
    const cls = getMetaClassById('Configuration');
    expect(cls).toBe(Configuration);
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
      theme(): Theme {
        return new Theme();
      }
    }
    application.start();
    const t1 = application.getComponent(Theme);
    const t2 = application.getComponent(Theme);
    expect(t1).toBeInstanceOf(Theme);
    expect(t1).toBe(t2);
  });

  test('通过对象传入要注册的ioc组件，可以设置prototype模式', () => {
    class Button {}

    @configuration()
    class WebAppConfiguration {
      @scope(SCOPE.Prototype)
      @component()
      button(): Button {
        return new Button();
      }
    }

    application.start();
    const b1 = application.getComponent(Button);
    const b2 = application.getComponent(Button);
    expect(b1).toBeInstanceOf(Button);
    expect(b2).toBeInstanceOf(Button);
    expect(b1).not.toBe(b2);
  });
});
