import { getByText, queryAllByRole } from '@testing-library/dom';

let Application;
let application;
let cocoMvc;
let view;
let reactive;
let memoized;
let component;
let Memoized;
let bind;
let consoleErrorSpy;
describe('@memoized装饰器', () => {
    beforeEach(async () => {
        cocoMvc = await import('@cocojs/mvc');
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        view = cocoMvc.view;
        reactive = cocoMvc.reactive;
        memoized = cocoMvc.memoized;
        component = cocoMvc.component;
        Memoized = cocoMvc.Memoized;
        bind = cocoMvc.bind;
        Application = cocoMvc.Application;
        application = new Application();
        cocoMvc.registerMvcApi(application);
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
        consoleErrorSpy.mockRestore();
        jest.resetModules();
    });

    test('支持通过id获取Memoized类', () => {
        application.start();
        const cls = application.getMetaClassById('Memoized');
        expect(cls).toBe(Memoized);
    });

    test('@memoized装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @memoized('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@memoized',
            'method'
        );
    });

    test('@memoized装饰器不能装饰在class上', () => {
        @component()
        @memoized()
        class Button {}

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10004：%s 类上class装饰器 %s 只能用于装饰%s',
            'Button',
            '@memoized',
            'method'
        );
    });
});
