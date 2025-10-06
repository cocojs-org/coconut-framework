describe('@effect装饰器', () => {
  let cocoMvc;
  let Application;
  let application;
  let Effect;

  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    Effect = cocoMvc.Effect;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取Effect类', () => {
    application.start();
    const cls = application.getMetadataCls('Effect');
    expect(cls).toBe(Effect);
  });
});
