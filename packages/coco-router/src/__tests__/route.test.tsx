describe('@route装饰器', () => {
  let Application;
  let application;
  let cocoMvc;
  let route;
  let page;
  let RouteMetadata;
  let TestWebRender;

  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    RouteMetadata = cocoMvc.RouteMetadata;
    route = cocoMvc.route;
    page = cocoMvc.page;
    Application = cocoMvc.Application;
    TestWebRender = cocoMvc.TestWebRender;
    application = new Application({
      Render: {
        qualifier: 'TestWebRender',
      },
      bootComponents: {
        Router: {},
      },
    });
  });

  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取Route类', () => {
    application.start();
    const cls = application.getMetadataCls('Route');
    expect(cls).toBe(RouteMetadata);
  });
});
