describe('global-data', () => {
  let cocoMvc, Application, application, view, bind, globalData, autowired;
  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = (await import('coco-mvc')).Application;
    view = (await import('coco-mvc')).view;
    bind = (await import('coco-mvc')).bind;
    globalData = (await import('coco-mvc')).globalData;
    autowired = (await import('coco-mvc')).autowired;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
  });

  test('可以获取到globalData，并且是同一引用', async () => {
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
