describe('@layout装饰器', () => {
  let cocoMvc;
  let Application;
  let application;
  let Layout;

  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    Layout = cocoMvc.Layout;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取Layout类', () => {
    application.start();
    const cls = application.getMetadataCls('Layout');
    expect(cls).toBe(Layout);
  });
});
