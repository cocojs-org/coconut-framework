describe('@layout装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let Layout;
    let getMetaClassById;

    beforeEach(async () => {
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        Layout = cocoMvc.Layout;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
    });

    test('支持通过id获取Layout类', () => {
        application.start();
        const cls = getMetaClassById('Layout');
        expect(cls).toBe(Layout);
    });
});
