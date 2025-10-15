describe('@effect装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let Effect;
    let getMetaClassById;

    beforeEach(async () => {
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        Effect = cocoMvc.Effect;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
    });

    test('支持通过id获取Effect类', () => {
        application.start();
        const cls = getMetaClassById('Effect');
        expect(cls).toBe(Effect);
    });
});
