describe('@localStorage装饰器', () => {
  let cocoMvc;
  let Application;
  let application;
  let LocalStorage;

  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    LocalStorage = cocoMvc.LocalStorage;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取LocalStorage类', () => {
    application.start();
    const cls = application.getMetadataCls('LocalStorage');
    expect(cls).toBe(LocalStorage);
  });
});
