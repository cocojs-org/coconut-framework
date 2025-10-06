describe('@api装饰器', () => {
  let cocoMvc;
  let Application;
  let application;
  let Api;
  let getMetaClassById;

  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    Api = cocoMvc.Api;
    getMetaClassById = cocoMvc.getMetaClassById;
    application = new Application();
    cocoMvc.registerApplication(application, getMetaClassById);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取Api类', () => {
    application.start();
    const cls = getMetaClassById('Api');
    expect(cls).toBe(Api);
  });
});
