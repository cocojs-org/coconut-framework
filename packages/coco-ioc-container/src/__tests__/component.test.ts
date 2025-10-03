describe('@component装饰器', () => {
  let Application;
  let application;
  let webApplication;
  let cocoMvc;
  let Metadata;
  let target;
  let Target;
  let view;
  let page;
  let layout;
  let controller;
  let component;
  let Component;
  let consoleErrorSpy;

  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {});
    cocoMvc = await import('coco-mvc');
    view = cocoMvc.view;
    page = cocoMvc.page;
    layout = cocoMvc.layout;
    target = cocoMvc.target;
    component = cocoMvc.component;
    controller = cocoMvc.controller;
    Metadata = cocoMvc.Metadata;
    Target = cocoMvc.Target;
    Component = cocoMvc.Component;
    webApplication = cocoMvc.webApplication;
    Application = cocoMvc.Application;
    application = new Application();
    cocoMvc.registerApplication(application);
  });

  afterEach(() => {
    // _test_helper.iocContainer.clear();
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
    consoleErrorSpy.mockRestore();
  });

  describe('@component装饰在类上', () => {
    test('不能同时添加2个component装饰器', () => {
      @component()
      @component()
      @target([Target.Type.Class])
      class ErrorButton extends Metadata {}

      application.start();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'CO10003：在一个类上不能添加多次同一个装饰器，但%s上存在重复装饰器: %s',
        'ErrorButton',
        '@component'
      );
    });

    test('不能同时添加component装饰器和一个一级复合装饰器', () => {
      @view()
      @component()
      @target([Target.Type.Class])
      class ErrorButton extends Metadata {}

      application.start();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'CO10001：每个类最多只能添加一个component装饰器，但 %s 添加了：%s',
        'ErrorButton',
        '@component, @view'
      );
    });

    test('不能同时添加component装饰器和一个二级复合装饰器', () => {
      @page()
      @component()
      @target([Target.Type.Class])
      class ErrorButton extends Metadata {}

      application.start();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'CO10001：每个类最多只能添加一个component装饰器，但 %s 添加了：%s',
        'ErrorButton',
        '@component, @page'
      );
    });

    test('不能同时添加2个一级复合装饰器', () => {
      @controller()
      @view()
      @target([Target.Type.Class])
      class ErrorButton extends Metadata {}

      application.start();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'CO10001：每个类最多只能添加一个component装饰器，但 %s 添加了：%s',
        'ErrorButton',
        '@view, @controller'
      );
    });

    test('不能同时添加一个一级复合装饰器和一个二级复合装饰器', () => {
      @page()
      @view()
      @target([Target.Type.Class])
      class ErrorButton extends Metadata {}
      application.start();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'CO10001：每个类最多只能添加一个component装饰器，但 %s 添加了：%s',
        'ErrorButton',
        '@view, @page'
      );
    });

    test('不能同时添加2个二级component复合装饰器', () => {
      @page()
      @layout()
      @target([Target.Type.Class])
      class ErrorButton extends Metadata {}

      application.start();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'CO10001：每个类最多只能添加一个component装饰器，但 %s 添加了：%s',
        'ErrorButton',
        '@layout, @page'
      );
    });
  });

  describe('@component装饰在方法上', () => {
    test('当使用component注入第三方组件时，必须是配置类内部。', () => {
      class Theme {}
      @component()
      class Application {
        @component()
        theme() {
          return new Theme();
        }
      }

      application.start();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'CO10008：%s 类 %s 方法上有@component装饰器，但 %s 没有@configuration类装饰器或@configuration的复合装饰器',
        'Application',
        'theme',
        'Application'
      );
    });

    // TODO:
    xtest('不支持注入number类型', () => {
      @webApplication()
      class Application {
        @component()
        theme() {
          return 1;
        }
      }
    });

    // TODO:
    xtest('不支持注入string类型', () => {
      @webApplication()
      class Application {
        @component()
        theme() {
          return '1';
        }
      }
    });

    // TODO:
    xtest('不支持注入boolean类型', () => {
      @webApplication()
      class Application {
        @component()
        theme() {
          return true;
        }
      }
    });

    // TODO:
    xtest('不支持注入Symbol类型', () => {
      @webApplication()
      class Application {
        @component()
        theme() {
          return Symbol('1');
        }
      }
    });

    // TODO:
    xtest('不支持注入Array类型', () => {
      @webApplication()
      class Application {
        @component()
        theme() {
          return [1, 2, 3];
        }
      }
    });

    // TODO:
    xtest('不支持注入Object类型', () => {
      @webApplication()
      class Application {
        @component()
        theme() {
          return { name: '1' };
        }
      }
    });

    // TODO:
    xtest('不支持注入Set类型', () => {
      @webApplication()
      class Application {
        @component()
        theme() {
          return new Set([1, 2, 3]);
        }
      }
    });

    // TODO:
    xtest('不支持注入Map类型', () => {
      @webApplication()
      class Application {
        @component()
        theme() {
          return new Map([
            ['1', 1],
            ['2', 2],
            ['3', 3],
          ]);
        }
      }
    });
  });
});
