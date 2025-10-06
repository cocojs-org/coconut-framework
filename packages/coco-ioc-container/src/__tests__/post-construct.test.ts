let cocoMvc;
let Application;
let application;
let component;
let Metadata;
describe('decorator', () => {
  const mockFn = jest.fn();

  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    Metadata = cocoMvc.Metadata;
    component = cocoMvc.component;
    application = new Application();
  });

  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterMvcApi();
    jest.resetModules();
  });

  test('类的postConstruct调用是从下往上的', () => {
    class A extends Metadata {}
    const a = cocoMvc.createDecoratorExp(A, {
      componentPostConstruct: function () {
        mockFn('a');
      },
    });
    class B extends Metadata {}
    const b = cocoMvc.createDecoratorExp(B, {
      componentPostConstruct: function () {
        mockFn('b');
      },
    });

    @a()
    @b()
    @component()
    class Button {}
    application.start();
    application.getComponent(Button);
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn.mock.calls[0][0]).toBe('b');
    expect(mockFn.mock.calls[1][0]).toBe('a');
  });
});
