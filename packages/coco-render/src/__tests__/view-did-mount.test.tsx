import { getByRole, getByText, waitFor } from '@testing-library/dom';

const appDidMount = jest.fn();

let Application;
let application;
let cocoMvc;
let view;
let reactive;
let bind;
let getMetaClassById;
describe('viewDidMount', () => {
    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        view = cocoMvc.view;
        reactive = cocoMvc.reactive;
        bind = cocoMvc.bind;
        Application = cocoMvc.Application;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
        jest.resetModules();
    });

    test('App的viewDidMount被调用', () => {
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

        @view()
        class App {
            viewDidMount() {
                appDidMount();
            }

            render() {
                return (
                    <h1>
                        <Button />
                    </h1>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<App />, container);
        const header = getByRole(container, 'heading');
        const button = getByRole(header, 'button');
        expect(button).toBeTruthy();
        expect(getByText(button, 'count:1')).toBeTruthy();
        expect(appDidMount).toHaveBeenCalledTimes(1);
    });
});
