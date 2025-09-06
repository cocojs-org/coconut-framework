describe('@target装饰器', () => {
  let Application;
  let application;
  let cocoMvc;
  let Metadata;
  let target;
  let Target;
  let component;
  let createDecoratorExp;
  let Component;
  let consoleErrorSpy;

  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {});
    cocoMvc = await import('coco-mvc');
    createDecoratorExp = cocoMvc.createDecoratorExp;
    target = cocoMvc.target;
    component = cocoMvc.component;
    Metadata = cocoMvc.Metadata;
    Target = cocoMvc.Target;
    Component = cocoMvc.Component;
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

  test('filed上不能使用target装饰器', async () => {
    @component()
    class Button {
      @target([Target.Type.Field])
      field: string;
    }

    application.start();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
      'Button',
      'field',
      '@target',
      'class'
    );
  });

  test('method上不能使用target装饰器', async () => {
    @component()
    class Button {
      @target([Target.Type.Method])
      click(): string {
        return '123';
      }
    }

    application.start();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
      'Button',
      'click',
      '@target',
      'class'
    );
  });

  test('元数据类不能缺少target装饰器', async () => {
    @component()
    class AutoBind extends Metadata {}

    application.start();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CO10002：元数据类 %s 必须有@target装饰器表明装饰目标',
      'AutoBind'
    );
  });

  test('业务类不需要target装饰器', async () => {
    @component()
    @target([Target.Type.Field])
    class Button {}

    application.start();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CO10007：业务类 %s 不需要添加@target装饰器',
      'Button'
    );
  });

  test('装饰目标是field的装饰器不能装饰在class上', async () => {
    @target([Target.Type.Field])
    class FieldDecorator extends Metadata {}
    const fieldDecorator = createDecoratorExp(FieldDecorator);

    @component()
    @fieldDecorator()
    class Button {}

    application.start();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CO10004：%s 类上class装饰器 %s 只能用于装饰%s',
      'Button',
      '@fieldDecorator',
      'field'
    );
  });

  test('装饰目标是class的装饰器不能装饰在field上', async () => {
    @target([Target.Type.Class])
    class ClassDecorator extends Metadata {}
    const classDecorator = createDecoratorExp(ClassDecorator);

    @component()
    class Button {
      @classDecorator()
      field: string;
    }

    application.start();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
      'Button',
      'field',
      '@classDecorator',
      'class'
    );
  });

  test('装饰目标是class的装饰器不能装饰在method上', async () => {
    @target([Target.Type.Class])
    class ClassDecorator extends Metadata {}
    const classDecorator = createDecoratorExp(ClassDecorator);

    @component()
    class Button {
      @classDecorator()
      get() {
        return '123';
      }
    }

    application.start();
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
      'Button',
      'get',
      '@classDecorator',
      'class'
    );
  });
});
