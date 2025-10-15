describe('@route装饰器', () => {
    let Application;
    let application;
    let cocoMvc;
    let route;
    let page;
    let RouteMetadata;
    let TestWebRender;
    let getMetaClassById;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        RouteMetadata = cocoMvc.RouteMetadata;
        route = cocoMvc.route;
        page = cocoMvc.page;
        Application = cocoMvc.Application;
        TestWebRender = cocoMvc.TestWebRender;
        getMetaClassById = cocoMvc.getMetaClassById;
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
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
    });

    test('支持通过id获取Route类', () => {
        application.start();
        const cls = getMetaClassById('Route');
        expect(cls).toBe(RouteMetadata);
    });
});
