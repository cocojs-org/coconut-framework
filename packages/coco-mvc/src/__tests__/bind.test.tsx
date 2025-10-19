import { getByLabelText, getByRole, getByText, queryByTestId, waitFor } from '@testing-library/dom';

describe('decorator', () => {
    let cocoMvc;
    let Application;
    let application;
    let view;
    let reactive;
    let bind;
    let Bind;
    let getMetaClassById;
    let component;
    let consoleErrorSpy;

    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        view = cocoMvc.view;
        bind = cocoMvc.bind;
        Bind = cocoMvc.Bind;
        reactive = cocoMvc.reactive;
        component = cocoMvc.component;
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

    test('支持通过id获取Bind类', () => {
        application.start();
        const cls = getMetaClassById('Bind');
        expect(cls).toBe(Bind);
    });

    test('@bind装饰器不能装饰在class上', () => {
        @component()
        @bind()
        class Button {}

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10004：%s 类上class装饰器 %s 只能用于装饰%s',
            'Button',
            '@bind',
            'method'
        );
    });

    test('@bind装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @bind()
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@bind',
            'method'
        );
    });

    test('正常渲染一个组件', () => {
        @view()
        class Button {
            @reactive()
            count = 1;

            label() {
                return `count:${this.count}`;
            }

            @bind()
            onClick() {
                this.count = 2;
            }

            render() {
                return <button onClick={this.onClick}>{this.label()}</button>;
            }
        }
        application.start();
        const container = document.createElement('div');
        cocoMvc.render(<Button />, container);
        const button = getByRole(container, 'button');
        expect(button).toBeTruthy();
        expect(getByText(button, 'count:1')).toBeTruthy();
        button.click();
        expect(getByText(button, 'count:2')).toBeTruthy();
    });
});
