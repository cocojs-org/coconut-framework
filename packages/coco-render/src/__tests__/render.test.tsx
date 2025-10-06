describe('@render装饰器', () => {
  let Application;
  let application;
  let cocoMvc;
  let view;
  let RenderMatadata;
  let consoleWarnSpy;

  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    view = cocoMvc.view;
    RenderMatadata = cocoMvc.RenderMatadata;
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

  test('支持通过id获取Render类', () => {
    application.start();
    const cls = application.getMetadataCls('Render');
    expect(cls).toBe(RenderMatadata);
  });
});
