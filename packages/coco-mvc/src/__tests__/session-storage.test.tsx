describe('@sessionStorage装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let SessionStorage;
    let getMetaClassById;

    beforeEach(async () => {
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        SessionStorage = cocoMvc.SessionStorage;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
    });

    test('支持通过id获取SessionStorage类', () => {
        application.start();
        const cls = getMetaClassById('SessionStorage');
        expect(cls).toBe(SessionStorage);
    });
});
