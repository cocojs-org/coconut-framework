describe('@value装饰器', () => {
  let Application;
  let application;
  let cocoMvc;
  let Metadata;
  let createDecoratorExp;
  let Value;
  let consoleErrorSpy;

  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {});
    cocoMvc = await import('coco-mvc');
    createDecoratorExp = cocoMvc.createDecoratorExp;
    Metadata = cocoMvc.Metadata;
    Application = cocoMvc.Application;
    Value = cocoMvc.Value;
    application = new Application();
    cocoMvc.registerApplication(application);
  });

  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
    consoleErrorSpy.mockRestore();
  });

  test('支持通过id获取Value类', () => {
    application.start();
    const cls = application.getMetadataCls('Value');
    expect(cls).toBe(Value);
  });
});
