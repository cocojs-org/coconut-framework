describe('@sessionStorage装饰器', () => {
  let cocoMvc;
  let Application;
  let application;
  let SessionStorage;

  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    SessionStorage = cocoMvc.SessionStorage;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取SessionStorage类', () => {
    application.start();
    const cls = application.getMetadataCls('SessionStorage');
    expect(cls).toBe(SessionStorage);
  });
});
