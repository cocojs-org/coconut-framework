describe('ioc-component-definition', () => {
    let cocoMvc;
    let Application;
    let application;
    let component;
    let Component;
    let Target;
    let target;
    let scope;
    let Scope;
    let SCOPE;
    let Metadata;
    let createDecoratorExp;

    beforeEach(async () => {
        cocoMvc = await import('@cocojs/mvc');
        Application = cocoMvc.Application;
        component = cocoMvc.component;
        Component = cocoMvc.Component;
        Target = cocoMvc.Target;
        target = cocoMvc.target;
        scope = cocoMvc.scope;
        Scope = cocoMvc.Scope;
        SCOPE = cocoMvc.SCOPE;
        Metadata = cocoMvc.Metadata;
        createDecoratorExp = cocoMvc.createDecoratorExp;
        application = new Application();
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
        jest.resetModules();
    });

    test('元数据类有@component装饰器，对应装饰器就是组件装饰器', () => {
        @target([Target.Type.Class])
        @component()
        class One extends Metadata {}
        const one = createDecoratorExp(One);

        @one()
        class Button {}

        application.start();
        const comp1 = application.getComponent(Button);
        const comp2 = application.getComponent(Button);
        expect(comp1).toBe(comp2);
    });

    test('元数据类有2级装饰器，对应装饰器就是组件装饰器', () => {
        @target([Target.Type.Class])
        @component()
        class One extends Metadata {}
        const one = createDecoratorExp(One);

        @target([Target.Type.Class])
        @one()
        class Two extends Metadata {}
        const two = createDecoratorExp(Two);

        @two()
        class Button {}

        application.start();
        const comp1 = application.getComponent(Button);
        const comp2 = application.getComponent(Button);
        expect(comp1).toBe(comp2);
    });

    test('元数据类有3级装饰器，对应装饰器就是组件装饰器', () => {
        @target([Target.Type.Class])
        @component()
        class One extends Metadata {}
        const one = createDecoratorExp(One);

        @target([Target.Type.Class])
        @one()
        class Two extends Metadata {}
        const two = createDecoratorExp(Two);

        @target([Target.Type.Class])
        @two()
        class Three extends Metadata {}
        const three = createDecoratorExp(Three);

        @three()
        class Button {}

        application.start();
        const comp1 = application.getComponent(Button);
        const comp2 = application.getComponent(Button);
        expect(comp1).toBe(comp2);
    });

    test('元数据类有4级装饰器，对应装饰器就是组件装饰器', () => {
        @target([Target.Type.Class])
        @component()
        class One extends Metadata {}
        const one = createDecoratorExp(One);

        @target([Target.Type.Class])
        @one()
        class Two extends Metadata {}
        const two = createDecoratorExp(Two);

        @target([Target.Type.Class])
        @two()
        class Three extends Metadata {}
        const three = createDecoratorExp(Three);

        @target([Target.Type.Class])
        @three()
        class Four extends Metadata {}
        const four = createDecoratorExp(Four);

        @four()
        class Button {}

        application.start();
        const comp1 = application.getComponent(Button);
        const comp2 = application.getComponent(Button);
        expect(comp1).toBe(comp2);
    });

    test('元数据类有5级装饰器，对应装饰器就是组件装饰器', () => {
        @target([Target.Type.Class])
        @component()
        class One extends Metadata {}
        const one = createDecoratorExp(One);

        @target([Target.Type.Class])
        @one()
        class Two extends Metadata {}
        const two = createDecoratorExp(Two);

        @target([Target.Type.Class])
        @two()
        class Three extends Metadata {}
        const three = createDecoratorExp(Three);

        @target([Target.Type.Class])
        @three()
        class Four extends Metadata {}
        const four = createDecoratorExp(Four);

        @target([Target.Type.Class])
        @four()
        class Five extends Metadata {}
        const five = createDecoratorExp(Five);

        @five()
        class Button {}

        application.start();
        const comp1 = application.getComponent(Button);
        const comp2 = application.getComponent(Button);
        expect(comp1).toBe(comp2);
    });

    test('元数据类有6级装饰器，对应装饰器就是组件装饰器', () => {
        @target([Target.Type.Class])
        @component()
        class One extends Metadata {}
        const one = createDecoratorExp(One);

        @target([Target.Type.Class])
        @one()
        class Two extends Metadata {}
        const two = createDecoratorExp(Two);

        @target([Target.Type.Class])
        @two()
        class Three extends Metadata {}
        const three = createDecoratorExp(Three);

        @target([Target.Type.Class])
        @three()
        class Four extends Metadata {}
        const four = createDecoratorExp(Four);

        @target([Target.Type.Class])
        @four()
        class Five extends Metadata {}
        const five = createDecoratorExp(Five);

        @target([Target.Type.Class])
        @five()
        class Six extends Metadata {}
        const six = createDecoratorExp(Six);

        @six()
        class Button {}

        application.start();
        const comp1 = application.getComponent(Button);
        const comp2 = application.getComponent(Button);
        expect(comp1).toBe(comp2);
    });

    test('元数据类有7级装饰器，对应装饰器就是组件装饰器', () => {
        @target([Target.Type.Class])
        @component()
        class One extends Metadata {}
        const one = createDecoratorExp(One);

        @target([Target.Type.Class])
        @one()
        class Two extends Metadata {}
        const two = createDecoratorExp(Two);

        @target([Target.Type.Class])
        @two()
        class Three extends Metadata {}
        const three = createDecoratorExp(Three);

        @target([Target.Type.Class])
        @three()
        class Four extends Metadata {}
        const four = createDecoratorExp(Four);

        @target([Target.Type.Class])
        @four()
        class Five extends Metadata {}
        const five = createDecoratorExp(Five);

        @target([Target.Type.Class])
        @five()
        class Six extends Metadata {}
        const six = createDecoratorExp(Six);

        @target([Target.Type.Class])
        @six()
        class Seven extends Metadata {}
        const seven = createDecoratorExp(Seven);

        @seven()
        class Button {}

        application.start();
        const comp1 = application.getComponent(Button);
        const comp2 = application.getComponent(Button);
        expect(comp1).toBe(comp2);
    });

    test('元数据类有8级装饰器，对应装饰器就是组件装饰器', () => {
        @target([Target.Type.Class])
        @component()
        class One extends Metadata {}
        const one = createDecoratorExp(One);

        @target([Target.Type.Class])
        @one()
        class Two extends Metadata {}
        const two = createDecoratorExp(Two);

        @target([Target.Type.Class])
        @two()
        class Three extends Metadata {}
        const three = createDecoratorExp(Three);

        @target([Target.Type.Class])
        @three()
        class Four extends Metadata {}
        const four = createDecoratorExp(Four);

        @target([Target.Type.Class])
        @four()
        class Five extends Metadata {}
        const five = createDecoratorExp(Five);

        @target([Target.Type.Class])
        @five()
        class Six extends Metadata {}
        const six = createDecoratorExp(Six);

        @target([Target.Type.Class])
        @six()
        class Seven extends Metadata {}
        const seven = createDecoratorExp(Seven);

        @target([Target.Type.Class])
        @seven()
        class Eight extends Metadata {}
        const eight = createDecoratorExp(Eight);

        @eight()
        class Button {}

        application.start();
        const comp1 = application.getComponent(Button);
        const comp2 = application.getComponent(Button);
        expect(comp1).toBe(comp2);
    });

    test('元数据类有9级装饰器，对应装饰器就是组件装饰器', () => {
        @target([Target.Type.Class])
        @component()
        class One extends Metadata {}
        const one = createDecoratorExp(One);

        @target([Target.Type.Class])
        @one()
        class Two extends Metadata {}
        const two = createDecoratorExp(Two);

        @target([Target.Type.Class])
        @two()
        class Three extends Metadata {}
        const three = createDecoratorExp(Three);

        @target([Target.Type.Class])
        @three()
        class Four extends Metadata {}
        const four = createDecoratorExp(Four);

        @target([Target.Type.Class])
        @four()
        class Five extends Metadata {}
        const five = createDecoratorExp(Five);

        @target([Target.Type.Class])
        @five()
        class Six extends Metadata {}
        const six = createDecoratorExp(Six);

        @target([Target.Type.Class])
        @six()
        class Seven extends Metadata {}
        const seven = createDecoratorExp(Seven);

        @target([Target.Type.Class])
        @seven()
        class Eight extends Metadata {}
        const eight = createDecoratorExp(Eight);

        @target([Target.Type.Class])
        @eight()
        class Nine extends Metadata {}
        const nine = createDecoratorExp(Nine);

        @nine()
        class Button {}

        application.start();
        const comp1 = application.getComponent(Button);
        const comp2 = application.getComponent(Button);
        expect(comp1).toBe(comp2);
    });

    test('元数据类有10级装饰器，对应装饰器就是组件装饰器，理论上无限级', () => {
        @target([Target.Type.Class])
        @component()
        class One extends Metadata {}
        const one = createDecoratorExp(One);

        @target([Target.Type.Class])
        @one()
        class Two extends Metadata {}
        const two = createDecoratorExp(Two);

        @target([Target.Type.Class])
        @two()
        class Three extends Metadata {}
        const three = createDecoratorExp(Three);

        @target([Target.Type.Class])
        @three()
        class Four extends Metadata {}
        const four = createDecoratorExp(Four);

        @target([Target.Type.Class])
        @four()
        class Five extends Metadata {}
        const five = createDecoratorExp(Five);

        @target([Target.Type.Class])
        @five()
        class Six extends Metadata {}
        const six = createDecoratorExp(Six);

        @target([Target.Type.Class])
        @six()
        class Seven extends Metadata {}
        const seven = createDecoratorExp(Seven);

        @target([Target.Type.Class])
        @seven()
        class Eight extends Metadata {}
        const eight = createDecoratorExp(Eight);

        @target([Target.Type.Class])
        @eight()
        class Nine extends Metadata {}
        const nine = createDecoratorExp(Nine);

        @target([Target.Type.Class])
        @nine()
        class Ten extends Metadata {}
        const ten = createDecoratorExp(Ten);

        @ten()
        class Button {}

        application.start();
        const comp1 = application.getComponent(Button);
        const comp2 = application.getComponent(Button);
        expect(comp1).toBe(comp2);
    });
});
