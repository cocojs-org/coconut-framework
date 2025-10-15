import { getByLabelText, getByRole, getByText, queryByTestId, waitFor } from '@testing-library/dom';

describe('decorator', () => {
    let cocoMvc, Application, application, view, reactive, bind, Bind, getMetaClassById;
    beforeEach(async () => {
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        view = cocoMvc.view;
        bind = cocoMvc.bind;
        Bind = cocoMvc.Bind;
        reactive = cocoMvc.reactive;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
    });

    test('支持通过id获取Bind类', () => {
        application.start();
        const cls = getMetaClassById('Bind');
        expect(cls).toBe(Bind);
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
