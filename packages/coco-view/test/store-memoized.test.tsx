import {
    getAllByRole,
    getByLabelText,
    getByRole,
    getByText,
    queryAllByRole,
    queryByTestId,
    waitFor,
} from '@testing-library/dom';

describe('@store和@memoized联动功能', () => {
    let Application;
    let application;
    let cocoMvc;
    let component;
    let view;
    let store;
    let Store;
    let reactive;
    let autowired;
    let memoized;
    let bind;
    let consoleWarnSpy;
    let consoleErrorSpy;
    beforeEach(async () => {
        cocoMvc = await import('@cocojs/mvc');
        component = cocoMvc.component;
        view = cocoMvc.view;
        store = cocoMvc.store;
        Store = cocoMvc.Store;
        reactive = cocoMvc.reactive;
        autowired = cocoMvc.autowired;
        memoized = cocoMvc.memoized;
        bind = cocoMvc.bind;
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

    it('修改store的属性时，使用store属性的memoized函数也应该重新执行', () => {
        const fn = jest.fn();

        @store()
        class UserInfo {
            @reactive()
            name: string = '张三';
        }

        @view()
        class Detail {
            @reactive()
            showColon: boolean = true;

            @bind()
            notShowColon() {
                this.showColon = false;
            }

            @autowired()
            userInfo: UserInfo;

            @memoized()
            label() {
                fn();
                return this.userInfo?.name;
            }

            render() {
                return (
                    <h1 onClick={this.notShowColon}>
                        展示{this.showColon ? ':' : ''}
                        {this.label()}
                    </h1>
                );
            }
        }

        @view()
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
        expect(fn).toHaveBeenCalledTimes(1);
        const input = getByRole(container, 'button');
        expect(getByText(input, 'input:张三')).toBeTruthy();
        const heading = getByRole(container, 'heading');
        expect(getByText(heading, '展示:张三')).toBeTruthy();
        input.click();
        expect(fn).toHaveBeenCalledTimes(2);
        expect(getByText(input, 'input:李四')).toBeTruthy();
        expect(getByText(heading, '展示:李四')).toBeTruthy();
        // 没有修改store，所以不会触发memoized重新计算
        heading.click();
        expect(fn).toHaveBeenCalledTimes(2);
        expect(getByText(input, 'input:李四')).toBeTruthy();
        expect(getByText(heading, '展示李四')).toBeTruthy();
    });

    it('修改store的属性时，如果memoized函数没有使用到该属性，则应该使用缓存', () => {
        const fn = jest.fn();

        @store()
        class UserInfo {
            @reactive()
            name: string = '张三';
            @reactive()
            showColon: boolean = true;
        }

        @view()
        class Detail {
            @autowired()
            userInfo: UserInfo;

            @bind()
            notShowColon() {
                this.userInfo.showColon = false;
            }

            @memoized()
            label() {
                fn();
                return this.userInfo?.name;
            }

            render() {
                return <h1 onClick={this.notShowColon}>展示:{this.label()}</h1>;
            }
        }

        @view()
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
        expect(fn).toHaveBeenCalledTimes(1);
        const input = getByRole(container, 'button');
        expect(getByText(input, 'input:张三')).toBeTruthy();
        const heading = getByRole(container, 'heading');
        expect(getByText(heading, '展示:张三')).toBeTruthy();
        input.click();
        expect(fn).toHaveBeenCalledTimes(2);
        expect(getByText(input, 'input:李四')).toBeTruthy();
        expect(getByText(heading, '展示:李四')).toBeTruthy();
        // 虽然修改了store的useColon，但不会触发memoized重新计算
        heading.click();
        expect(fn).toHaveBeenCalledTimes(2);
        expect(getByText(input, 'input:李四')).toBeTruthy();
        expect(getByText(heading, '展示:李四')).toBeTruthy();
    });
});
