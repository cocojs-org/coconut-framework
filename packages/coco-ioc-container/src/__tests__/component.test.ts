let Application;
let application;
let webApplication;
let cocoMvc;
let view;
let page;
let layout;
let controller;
let component;
let Component;
describe('不能同时添加一个component装饰器和一个component的复合装饰器', () => {
  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    view = cocoMvc.view;
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
    // _test_helper.iocContainer.clear();
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  describe('@component装饰在类上', () => {
    test('不能同时添加一个component装饰器和一个component的复合装饰器', async () => {
      let throwError = false;
      try {
        @view()
        @component()
        class ErrorButton {}
      } catch (e) {
        throwError = true;
      }

      expect(throwError).toBe(true);
    });

    test('不能同时添加一个component装饰器和一个component的复合装饰器的复合装饰器', async () => {
      let throwError = false;
      try {
        @page()
        @component()
        class ErrorButton {}
      } catch (e) {
        throwError = true;
      }

      expect(throwError).toBe(true);
    });

    test('不能同时添加2个component的复合装饰器', async () => {
      let throwError = false;
      try {
        @controller()
        @view()
        class ErrorButton {}
      } catch (e) {
        throwError = true;
      }

      expect(throwError).toBe(true);
    });

    test('不能同时添加一个component复合装饰器和一个component的复合装饰器的复合装饰器', async () => {
      let throwError = false;
      try {
        @page()
        @view()
        class ErrorButton {}
      } catch (e) {
        throwError = true;
      }

      expect(throwError).toBe(true);
    });

    test('不能同时添加多个component的复合装饰器的复合装饰器', async () => {
      let throwError = false;
      try {
        @page()
        @layout()
        class ErrorButton {}
      } catch (e) {
        throwError = true;
      }

      expect(throwError).toBe(true);
    });
  });

  describe('@component装饰在方法上', () => {
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
      expect(t1 === t2).toBe(true);
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
      expect(b1 === b2).toBe(false);
    });
  });
});
