describe('@document装饰器', () => {
  let cocoMvc;
  let Application;
  let application;
  let Document;

  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    Document = cocoMvc.Document;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取Document类', () => {
    application.start();
    const cls = application.getMetadataCls('Document');
    expect(cls).toBe(Document);
  });
});
