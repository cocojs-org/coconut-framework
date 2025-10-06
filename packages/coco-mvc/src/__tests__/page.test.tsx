describe('@page装饰器', () => {
  let cocoMvc;
  let Application;
  let application;
  let Page;

  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    Page = cocoMvc.Page;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取Page类', () => {
    application.start();
    const cls = application.getMetadataCls('Page');
    expect(cls).toBe(Page);
  });
});
