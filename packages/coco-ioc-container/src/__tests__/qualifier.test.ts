describe('@qualifier装饰器: 通过装饰器配置', () => {
  let Application;
  let application;
  let webApplication;
  let cocoMvc;
  let view;
  let autowired;
  let qualifier;
  let component;
  let Component;
  let consoleErrorSpy;

  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {});
    cocoMvc = await import('coco-mvc');
    view = cocoMvc.view;
    autowired = cocoMvc.autowired;
    qualifier = cocoMvc.qualifier;
    component = cocoMvc.component;
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
    consoleErrorSpy.mockRestore();
  });

  test('qualifier装饰器不能装饰类和方法', () => {
    @qualifier()
    @component()
    class Button {
      @qualifier()
      click() {}
    }

    application.start();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
      'Button',
      'click',
      '@qualifier',
      'field'
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CO10004：%s 类上class装饰器 %s 只能用于装饰%s',
      'Button',
      '@qualifier',
      'field'
    );
  });

  test('@autowired注入的组件存在至少2个子组件，但是没有使用@qualifier，则抛出异常', () => {
    @component()
    class Parent {}
    @component()
    class Child extends Parent {}
    @component()
    class Child1 extends Parent {}

    @view()
    class UserInfo {
      @autowired()
      parent: Parent;
    }

    try {
      application.start();
      application.getComponent(UserInfo);
    } catch (e) {
      expect(e.message).toBe(
        'CO10009：实例化组件失败，Parent 类存在多个子类 Child,Child1，但没有使用@qualifier指定子类id'
      );
    }
  });

  test('@autowired注入的组件存在一个子组件，一个孙组件，但是没有使用@qualifier，则抛出异常', () => {
    @component()
    class Parent {}
    @component()
    class Child extends Parent {}
    @component()
    class Grandson extends Child {}

    @view()
    class UserInfo {
      @autowired()
      parent: Parent;
    }

    try {
      application.start();
      application.getComponent(UserInfo);
    } catch (e) {
      expect(e.message).toBe(
        'CO10009：实例化组件失败，Parent 类存在多个子类 Child,Grandson，但没有使用@qualifier指定子类id'
      );
    }
  });

  test('@autowired注入的组件存在多个子组件，使用@qualifier指定不存在的id，抛出异常', () => {
    @component()
    class Parent {}
    @component()
    class Child extends Parent {}
    @component()
    class Child1 extends Parent {}

    @view()
    class UserInfo {
      @qualifier('notExistId')
      @autowired()
      parent: Parent;
    }
    try {
      application.start();
      application.getComponent(UserInfo);
    } catch (e) {
      expect(e.message).toBe(
        'CO10010：实例化组件失败，Parent 类存在多个子类 Child,Child1，@qualifier装饰器指定了一个不存在的子类id: notExistId'
      );
    }
  });

  test('@autowired注入的组件存在多个子组件，使用@qualifier指定一个孙组件', () => {
    @component()
    class Parent {}
    @component()
    class Child extends Parent {}
    @component()
    class Grandson extends Child {}

    @view()
    class UserInfo {
      @qualifier('Grandson')
      @autowired()
      parent: Parent;
    }
    application.start();
    const user = application.getComponent(UserInfo);
    expect(user.parent instanceof Grandson).toBe(true);
  });
});

describe('@qualifier装饰器: 通过动态配置', () => {
  let Application;
  let application;
  let webApplication;
  let cocoMvc;
  let view;
  let autowired;
  let qualifier;
  let component;

  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    view = cocoMvc.view;
    autowired = cocoMvc.autowired;
    qualifier = cocoMvc.qualifier;
    component = cocoMvc.component;
    webApplication = cocoMvc.webApplication;
    Application = cocoMvc.Application;
  });

  afterEach(async () => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('@autowired注入的组件存在多个子组件，使用动态配置指定一个子组件', () => {
    application = new Application({
      Parent: {
        qualifier: 'Child',
      },
    });
    cocoMvc.registerApplication(application);

    @component()
    class Parent {}
    @component()
    class Child extends Parent {}
    @component()
    class Child1 extends Parent {}

    @view()
    class UserInfo {
      @qualifier('Child')
      @autowired()
      parent: Parent;
    }
    application.start();
    const user = application.getComponent(UserInfo);
    expect(user.parent instanceof Child).toBe(true);
  });
});
