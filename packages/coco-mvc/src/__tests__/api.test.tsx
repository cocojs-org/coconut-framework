describe('@api装饰器', () => {
  let cocoMvc;
  let Application;
  let application;
  let Api;

  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    Api = cocoMvc.Api;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取Api类', () => {
    application.start();
    const cls = application.getMetadataCls('Api');
    expect(cls).toBe(Api);
  });
});
