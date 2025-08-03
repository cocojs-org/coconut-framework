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
    cocoMvc.registerApplication(application);
  });

  afterEach(async () => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('类的postConstruct调用是从下往上的', async () => {
    class A extends Metadata {
      static postConstruct() {
        mockFn('a');
      }
    }
    const a = cocoMvc.createDecoratorExp(A);
    class B extends Metadata {
      static postConstruct() {
        mockFn('b');
      }
    }
    const b = cocoMvc.createDecoratorExp(B);

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
