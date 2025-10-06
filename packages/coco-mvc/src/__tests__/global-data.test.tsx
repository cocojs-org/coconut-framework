describe('@globalData装饰器', () => {
  let cocoMvc,
    Application,
    application,
    view,
    bind,
    globalData,
    GlobalData,
    autowired,
    getMetaClassById;
  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    view = cocoMvc.view;
    bind = cocoMvc.bind;
    globalData = cocoMvc.globalData;
    GlobalData = cocoMvc.GlobalData;
    autowired = cocoMvc.autowired;
    getMetaClassById = cocoMvc.getMetaClassById;
    application = new Application();
    cocoMvc.registerApplication(application, getMetaClassById);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
  });

  test('支持通过id获取GlobalData类', () => {
    application.start();
    const cls = getMetaClassById('GlobalData');
    expect(cls).toBe(GlobalData);
  });

  test('可以获取到globalData，并且是同一引用', () => {
    @globalData()
    class Login {
      token: string = 'mock token';
    }
    @view()
    class Button {
      @autowired()
      login: Login;

      render() {
        return <button>btn</button>;
      }
    }
    @view()
    class Button1 {
      @autowired()
      login: Login;

      render() {
        return <button>btn-1</button>;
      }
    }
    application.start();
    const btn = application.getComponent(Button);
    const btn1 = application.getComponent(Button1);
    expect(btn).not.toBe(btn1);
    expect(btn.login).toBe(btn1.login);
    expect(btn.login.token).toBe('mock token');
  });
});
