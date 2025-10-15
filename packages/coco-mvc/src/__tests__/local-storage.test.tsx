describe('@localStorage装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let LocalStorage;
    let getMetaClassById;

    beforeEach(async () => {
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        LocalStorage = cocoMvc.LocalStorage;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
    });

    test('支持通过id获取LocalStorage类', () => {
        application.start();
        const cls = getMetaClassById('LocalStorage');
        expect(cls).toBe(LocalStorage);
    });
});
