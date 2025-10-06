describe('autowired', () => {
  let Application;
  let application;
  let webApplication;
  let cocoMvc;
  let view;
  let autowired;
  let Autowired;
  let component;
  let Component;
  let scope;
  let SCOPE;

  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    view = cocoMvc.view;
    autowired = cocoMvc.autowired;
    Autowired = cocoMvc.Autowired;
    component = cocoMvc.component;
    scope = cocoMvc.scope;
    SCOPE = cocoMvc.SCOPE;
    Component = cocoMvc.Component;
    webApplication = cocoMvc.webApplication;
    Application = cocoMvc.Application;
    application = new Application();
    cocoMvc.registerApplication(application);
  });

  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取Autowired类', () => {
    application.start();
    const cls = application.getMetadataCls('Autowired');
    expect(cls).toBe(Autowired);
  });

  test('注入一个view组件，且拿到的实例也是不同的', () => {
    @view()
    class Button {}

    @view()
    class UserInfo {
      @autowired()
      button: Button;
    }
    application.start();
    const userInfo1 = application.getComponent(UserInfo);
    const userInfo2 = application.getComponent(UserInfo);
    expect(userInfo1.button instanceof Button).toBe(true);
    expect(userInfo2.button instanceof Button).toBe(true);
    expect(userInfo1.button).not.toBe(userInfo2.button);
  });

  test('如果通过autowired装饰器注入自己，则注入undefined', () => {
    @component()
    class Button {
      @autowired()
      button: Button;
    }
    application.start();
    const button = application.getComponent(Button);
    expect(button.button).toBe(undefined);
  });

  test('没有定义的组件，就会注入undefined', () => {
    @component()
    class Button {
      @autowired()
      like: Like;
    }

    application.start();
    const button = application.getComponent(Button);
    expect(button.like).toBe(undefined);
  });

  test('没有注册的组件，会抛异常', () => {
    let throwError = false;
    class Like {}
    @component()
    class Button {
      @autowired()
      like: Like;
    }

    application.start();
    try {
      application.getComponent(Button);
    } catch (e) {
      throwError = true;
      expect(e.message).toBe('CO10011：实例化组件失败，Like 类不是ioc组件');
    }
    expect(throwError).toBe(true);
  });

  test('注入一个默认配置的组件，默认单例组件', () => {
    @component()
    class Theme {}

    @view()
    class UserInfo {
      @autowired()
      theme: Theme;
    }
    application.start();
    const userInfo1 = application.getComponent(UserInfo);
    const userInfo2 = application.getComponent(UserInfo);
    expect(userInfo1.theme instanceof Theme).toBe(true);
    expect(userInfo1.theme).toBe(userInfo2.theme);
  });

  test('TODO:看一下为什么不能注入后面的组件', () => {
    @component()
    class ButtonA {
      @autowired()
      buttonB: ButtonB;
    }

    @component()
    class ButtonB {
      @autowired()
      buttonA: ButtonA;
    }

    application.start();
    const buttonB = application.getComponent(ButtonB);
    expect(buttonB).toBeInstanceOf(ButtonB);
    expect(buttonB.buttonA).toBeInstanceOf(ButtonA);
    expect(buttonB.buttonA.buttonB).toBe(undefined);
  });

  xtest('注入一个配置的组件，默认是单例组件', () => {
    class User {}

    @webApplication()
    class Application {
      @component()
      user() {
        return new User();
      }
    }
    @view()
    class UserInfo {
      @autowired()
      user: User;
    }

    application.start();
    const userInfo1 = application.getComponent(UserInfo);
    const userInfo2 = application.getComponent(UserInfo);
    expect(userInfo1.user instanceof User).toBe(true);
    expect(userInfo1.user).toBe(userInfo2.user);
  });

  xtest('注入一个配置的组件，原型模式则返回不同的组件', () => {
    class Computer {}

    @webApplication()
    class Application {
      @scope(SCOPE.Prototype)
      @component()
      computer() {
        return new Computer();
      }
    }

    @view()
    class UserInfo {
      @autowired()
      computer: Computer;
    }

    application.start();
    const userInfo1 = application.getComponent(UserInfo);
    const userInfo2 = application.getComponent(UserInfo);
    expect(userInfo1.computer instanceof Computer).toBe(true);
    expect(userInfo2.computer instanceof Computer).toBe(true);
    expect(userInfo1.computer).not.toBe(userInfo2.computer);
  });
});
