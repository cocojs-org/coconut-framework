describe('@util装饰器', () => {
  let cocoMvc;
  let Application;
  let application;
  let Util;

  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    Util = cocoMvc.Util;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取Util类', () => {
    application.start();
    const cls = application.getMetadataCls('Util');
    expect(cls).toBe(Util);
  });
});
