let Application;
let application;
let webApplication;
let cocoMvc;
let view;
let autowired;
let qualifier;
let layout;
let controller;
let component;
let Component;

describe('qualifier: 不动态配置', () => {
  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    view = cocoMvc.view;
    autowired = cocoMvc.autowired;
    qualifier = cocoMvc.qualifier;
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

  test('@autowired注入的组件存在至少2个子组件，但是没有使用@qualifier，则抛出异常', async () => {
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

    let error = false;
    try {
      application.start();
      application.getComponent(UserInfo);
    } catch (e) {
      error = true;
    }
    expect(error).toBe(true);
  });

  test('@autowired注入的组件存在多个子组件，使用@qualifier指定不存在的id，抛出异常', async () => {
    @component()
    class Parent {}
    @component()
    class Child extends Parent {}
    @component()
    class Child1 extends Parent {}

    @view()
    class UserInfo {
      @qualifier('hhhh')
      @autowired()
      parent: Parent;
    }
    let error = false;
    try {
      application.start();
      application.getComponent(UserInfo);
    } catch (e) {
      error = true;
    }
    expect(error).toBe(true);
  });

  test('@autowired注入的组件存在多个子组件，使用@qualifier指定一个子组件', async () => {
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

describe('qualifier: 使用动态配置', () => {
  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    view = cocoMvc.view;
    autowired = cocoMvc.autowired;
    qualifier = cocoMvc.qualifier;
    layout = cocoMvc.layout;
    component = cocoMvc.component;
    controller = cocoMvc.controller;
    Component = cocoMvc.Component;
    webApplication = cocoMvc.webApplication;
    Application = cocoMvc.Application;
  });

  afterEach(async () => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('@autowired注入的组件存在多个子组件，使用动态配置指定一个子组件', async () => {
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
