describe('@render装饰器', () => {
  let Application;
  let application;
  let cocoMvc;
  let view;
  let RenderMatadata;
  let getMetaClassById;
  let consoleWarnSpy;

  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    view = cocoMvc.view;
    RenderMatadata = cocoMvc.RenderMatadata;
    Application = cocoMvc.Application;
    getMetaClassById = cocoMvc.getMetaClassById;
    application = new Application();
    cocoMvc.registerMvcApi(application, getMetaClassById);
    consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
  });

  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterMvcApi();
    jest.resetModules();
    consoleWarnSpy.mockRestore();
  });

  test('支持通过id获取Render类', () => {
    application.start();
    const cls = getMetaClassById('Render');
    expect(cls).toBe(RenderMatadata);
  });
});
