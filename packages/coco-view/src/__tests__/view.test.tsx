import { getByLabelText, getByRole, getByText, queryByTestId, waitFor } from '@testing-library/dom';

describe('view', () => {
    let cocoMvc;
    let Application;
    let application;
    let view;
    let reactive;
    let bind;
    let View;
    let getMetaClassById;
    beforeEach(async () => {
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        view = cocoMvc.view;
        bind = cocoMvc.bind;
        reactive = cocoMvc.reactive;
        View = cocoMvc.View;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
    });

    test('支持通过id获取View类', () => {
        application.start();
        const cls = getMetaClassById('View');
        expect(cls).toBe(View);
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
        cocoMvc.render(<Button />, container);
        const button = getByRole(container, 'button');
        expect(button).toBeTruthy();
        expect(getByText(button, 'count:1')).toBeTruthy();
        button.click();
        expect(getByText(button, 'count:2')).toBeTruthy();
    });
});
