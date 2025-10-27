describe('decorator', () => {
    let cocoMvc;
    let Application;
    let application;
    let component;
    let Component;
    let Target;
    let scope;
    let Scope;
    let SCOPE;
    let instantiateMetadata;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        component = cocoMvc.component;
        Component = cocoMvc.Component;
        Target = cocoMvc.Target;
        scope = cocoMvc.scope;
        Scope = cocoMvc.Scope;
        SCOPE = cocoMvc.SCOPE;
        instantiateMetadata = cocoMvc.instantiateMetadata;
        application = new Application();
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
        jest.resetModules();
    });

    test('组件类的元数据正确', () => {
        @scope(SCOPE.Singleton)
        @component()
        class Button {}

        application.start();
        const asExpected = cocoMvc.checkClassMetadataAsExpected(application, Button, [
            instantiateMetadata(Component),
            instantiateMetadata(Scope, { value: SCOPE.Singleton }),
        ]);
        expect(asExpected).toBe(true);
    });
});
