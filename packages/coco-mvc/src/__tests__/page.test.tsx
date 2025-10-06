describe('@page装饰器', () => {
  let cocoMvc;
  let Application;
  let application;
  let Page;
  let getMetaClassById;

  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    Page = cocoMvc.Page;
    getMetaClassById = cocoMvc.getMetaClassById;
    application = new Application();
    cocoMvc.registerApplication(application, getMetaClassById);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取Page类', () => {
    application.start();
    const cls = getMetaClassById('Page');
    expect(cls).toBe(Page);
  });
});
