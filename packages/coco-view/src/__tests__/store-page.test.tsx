import {
    getAllByRole,
    getByLabelText,
    getByRole,
    getByText,
    queryAllByRole,
    queryByTestId,
    waitFor,
} from '@testing-library/dom';

describe('@store和@page联动功能', () => {
    let Application;
    let application;
    let cocoMvc;
    let component;
    let view;
    let page;
    let store;
    let Store;
    let autowired;
    let memoized;
    let bind;
    let reactive;
    let consoleWarnSpy;
    let consoleErrorSpy;
    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        component = cocoMvc.component;
        view = cocoMvc.view;
        page = cocoMvc.page;
        store = cocoMvc.store;
        Store = cocoMvc.Store;
        autowired = cocoMvc.autowired;
        memoized = cocoMvc.memoized;
        bind = cocoMvc.bind;
        reactive = cocoMvc.reactive;
        Application = cocoMvc.Application;
        application = new Application();
        cocoMvc.registerMvcApi(application);
        consoleWarnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {});
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
        jest.resetModules();
        consoleWarnSpy.mockRestore();
        consoleErrorSpy.mockRestore();
    });

    it('注入的store都是同一个对象的引用', () => {
        @store()
        class UserInfo {
            @reactive()
            name: string;
        }

        @page()
        class Detail {
            @autowired()
            userInfo: UserInfo;

            render() {
                return <h1>展示:{this.userInfo?.name}</h1>;
            }
        }

        @page()
        class Form {
            @autowired()
            userInfo: UserInfo;

            render() {
                return <button>input:{this.userInfo.name}</button>;
            }
        }

        application.start();
        const form = application.getComponent(Form);
        const detail = application.getComponent(Detail);
        expect(form.userInfo).toBeInstanceOf(UserInfo);
        expect(form.userInfo).toBe(detail.userInfo);
    });

    it('修改store的属性时，所有注入store的视图组件都会重新渲染', () => {
        @store()
        class UserInfo {
            @reactive()
            name: string;
        }

        @page()
        class Detail {
            @autowired()
            userInfo: UserInfo;

            render() {
                return <h1>展示:{this.userInfo?.name}</h1>;
            }
        }

        @page()
        class Form {
            @autowired()
            userInfo: UserInfo;

            handleClick = () => {
                this.userInfo.name = '李四';
            };

            render() {
                return <button onClick={this.handleClick}>input:{this.userInfo.name}</button>;
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(
            <div>
                <Form />
                <Detail />
            </div>,
            container
        );
        const input = getByRole(container, 'button');
        expect(getByText(input, 'input:')).toBeTruthy();
        const heading = getByRole(container, 'heading');
        expect(getByText(heading, '展示:')).toBeTruthy();
        input.click();
        expect(getByText(input, 'input:李四')).toBeTruthy();
        expect(getByText(heading, '展示:李四')).toBeTruthy();
    });
});
