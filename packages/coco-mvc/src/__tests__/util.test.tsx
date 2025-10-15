describe('@util装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let Util;
    let getMetaClassById;

    beforeEach(async () => {
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        Util = cocoMvc.Util;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
    });

    test('支持通过id获取Util类', () => {
        application.start();
        const cls = getMetaClassById('Util');
        expect(cls).toBe(Util);
    });
});
