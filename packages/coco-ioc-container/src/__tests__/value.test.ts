describe('@value装饰器', () => {
    let Application;
    let application;
    let cocoMvc;
    let Metadata;
    let createDecoratorExp;
    let Value;
    let getMetaClassById;
    let consoleErrorSpy;

    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        cocoMvc = await import('coco-mvc');
        createDecoratorExp = cocoMvc.createDecoratorExp;
        Metadata = cocoMvc.Metadata;
        Application = cocoMvc.Application;
        Value = cocoMvc.Value;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
        consoleErrorSpy.mockRestore();
    });

    test('支持通过id获取Value类', () => {
        application.start();
        const cls = getMetaClassById('Value');
        expect(cls).toBe(Value);
    });
});
