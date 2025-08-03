let Application;
let application;
let webApplication;
let cocoMvc;
let view;
let autowired;
let page;
let layout;
let controller;
let component;
let Component;
describe('autowired', () => {
  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    view = cocoMvc.view;
    autowired = cocoMvc.autowired;
    page = cocoMvc.page;
    layout = cocoMvc.layout;
    component = cocoMvc.component;
    controller = cocoMvc.controller;
    Component = cocoMvc.Component;
    webApplication = cocoMvc.webApplication;
    Application = cocoMvc.Application;
    application = new Application();
    cocoMvc.registerApplication(application);
  });

  afterEach(async () => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('注入一个view组件，且拿到的实例也是不同的', async () => {
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

  test('注入一个默认配置的组件，默认单例组件', async () => {
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

  test('注入一个配置的组件，默认是单例组件', async () => {
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

  test('注入一个配置的组件，原型模式则返回不同的组件', async () => {
    class Computer {}

    @webApplication()
    class Application {
      @component(Component.Scope.Prototype)
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
