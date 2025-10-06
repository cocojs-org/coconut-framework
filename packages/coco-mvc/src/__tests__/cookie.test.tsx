describe('@cookie装饰器', () => {
  let cocoMvc;
  let Application;
  let application;
  let Cookie;
  let getMetaClassById;

  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    Cookie = cocoMvc.Cookie;
    getMetaClassById = cocoMvc.getMetaClassById;
    application = new Application();
    cocoMvc.registerMvcApi(application, getMetaClassById);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterMvcApi();
    jest.resetModules();
  });

  test('支持通过id获取Cookie类', () => {
    application.start();
    const cls = getMetaClassById('Cookie');
    expect(cls).toBe(Cookie);
  });
});
