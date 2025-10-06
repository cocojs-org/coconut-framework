describe('@reactive装饰器', () => {
  let Application;
  let application;
  let cocoMvc;
  let view;
  let Reactive;
  let bind;
  let consoleWarnSpy;

  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    view = cocoMvc.view;
    Reactive = cocoMvc.Reactive;
    bind = cocoMvc.bind;
    Application = cocoMvc.Application;
    application = new Application();
    cocoMvc.registerApplication(application);
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
    consoleWarnSpy.mockRestore();
  });

  test('支持通过id获取Reactive类', () => {
    application.start();
    const cls = application.getMetadataCls('Reactive');
    expect(cls).toBe(Reactive);
  });
});
