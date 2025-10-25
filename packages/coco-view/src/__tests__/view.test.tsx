import { getByLabelText, getByRole, getByText, queryByTestId, waitFor } from '@testing-library/dom';

describe('view', () => {
    let cocoMvc;
    let Application;
    let application;
    let component;
    let view;
    let reactive;
    let bind;
    let View;
    let consoleErrorSpy;
    beforeEach(async () => {
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        component = cocoMvc.component;
        view = cocoMvc.view;
        bind = cocoMvc.bind;
        reactive = cocoMvc.reactive;
        View = cocoMvc.View;
        application = new Application();
        cocoMvc.registerMvcApi(application);
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
        jest.resetModules();
        consoleErrorSpy.mockRestore();
    });

    test('支持通过id获取View类', () => {
        application.start();
        const cls = application.getMetaClassById('View');
        expect(cls).toBe(View);
    });

    test('@view装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @view('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@view',
            'class'
        );
    });

    test('@view装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @view('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@view',
            'class'
        );
    });

    test('可以扫描到view组件并渲染', () => {
        @view()
        class Button {
            @reactive()
            count = 1;

            @bind()
            onClick() {
                this.count = 2;
            }

            render() {
                return <button onClick={this.onClick}>count:{this.count}</button>;
            }
        }
        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Button />, container);
        const button = getByRole(container, 'button');
        expect(button).toBeTruthy();
        expect(getByText(button, 'count:1')).toBeTruthy();
        button.click();
        expect(getByText(button, 'count:2')).toBeTruthy();
    });
});
