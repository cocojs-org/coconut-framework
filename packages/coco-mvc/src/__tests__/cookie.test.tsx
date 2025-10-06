describe('@cookie装饰器', () => {
  let cocoMvc;
  let Application;
  let application;
  let Cookie;

  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    Cookie = cocoMvc.Cookie;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取Cookie类', () => {
    application.start();
    const cls = application.getMetadataCls('Cookie');
    expect(cls).toBe(Cookie);
  });
});
