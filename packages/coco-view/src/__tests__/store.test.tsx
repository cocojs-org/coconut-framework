import {
    getAllByRole,
    getByLabelText,
    getByRole,
    getByText,
    queryAllByRole,
    queryByTestId,
    waitFor,
} from '@testing-library/dom';

describe('store', () => {
    let Application;
    let application;
    let cocoMvc;
    let component;
    let view;
    let store;
    let Store;
    let autowired;
    let memoized;
    let bind;
    let getMetaClassById;
    let consoleWarnSpy;
    let consoleErrorSpy;
    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        component = cocoMvc.component;
        view = cocoMvc.view;
        store = cocoMvc.store;
        Store = cocoMvc.Store;
        autowired = cocoMvc.autowired;
        memoized = cocoMvc.memoized;
        bind = cocoMvc.bind;
        Application = cocoMvc.Application;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
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

    test('支持通过id获取Store类', () => {
        application.start();
        const cls = getMetaClassById('Store');
        expect(cls).toBe(Store);
    });

    test('@store装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @store('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@store',
            'class'
        );
    });

    test('@store装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @store('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@store',
            'class'
        );
    });

    it('注入的store都是同一个对象的引用', () => {
        @store()
        class UserInfo {
            name: string = '张三';
        }

        @view()
        class Detail {
            @autowired()
            userInfo: UserInfo;

            render() {
                return <h1>展示:{this.userInfo?.name}</h1>;
            }
        }

        @view()
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
            name: string = '张三';
        }

        @view()
        class Detail {
            @autowired()
            userInfo: UserInfo;

            render() {
                return <h1>展示:{this.userInfo?.name}</h1>;
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
        const input = getByRole(container, 'button');
        expect(getByText(input, 'input:张三')).toBeTruthy();
        const heading = getByRole(container, 'heading');
        expect(getByText(heading, '展示:张三')).toBeTruthy();
        input.click();
        expect(getByText(input, 'input:李四')).toBeTruthy();
        expect(getByText(heading, '展示:李四')).toBeTruthy();
    });

    it('修改store的属性时，读取store的@memoized函数也应该重新执行', () => {
        @store()
        class UserInfo {
            name: string = '张三';
        }

        @view()
        class Detail {
            @autowired()
            userInfo: UserInfo;

            @memoized()
            label() {
                return `展示:${this.userInfo?.name}`;
            }

            render() {
                return <h1>{this.label()}</h1>;
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
        const input = getByRole(container, 'button');
        expect(getByText(input, 'input:张三')).toBeTruthy();
        const heading = getByRole(container, 'heading');
        expect(getByText(heading, '展示:张三')).toBeTruthy();
        input.click();
        expect(getByText(input, 'input:李四')).toBeTruthy();
        expect(getByText(heading, '展示:李四')).toBeTruthy();
    });

    it('卸载引用store的组件时，store和组件之间的订阅关系也会解除', () => {
        @store()
        class UserInfo {
            name: string = '张三';
        }

        @view()
        class Detail {
            @autowired()
            userInfo: UserInfo;

            label() {
                return `展示:${this.userInfo?.name}`;
            }

            render() {
                return <h1>展示:{this.userInfo?.name}</h1>;
            }
        }

        @view()
        class Form {
            @autowired()
            userInfo: UserInfo;

            label() {
                return `input:${this.userInfo.name}`;
            }

            @bind()
            handleClick() {
                this.userInfo.name = '李四';
            }

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
        const userinfo = application.getComponent(UserInfo);
        const subscribers = userinfo.storePublisher.getSubscribers();
        expect(subscribers.length).toBe(2);
        // 卸载Detail组件
        cocoMvc.renderIntoContainer(
            <div>
                <Form />
            </div>,
            container
        );
        expect(subscribers.length).toBe(1);
    });

    it('一个组件多次注入同一个store，会有warn提醒', () => {
        @store()
        class UserInfo {
            name: string = '张三';
        }

        @view()
        class Detail {
            @autowired()
            userInfo: UserInfo;

            @autowired()
            userInfo1: UserInfo;

            render() {
                return <h1>展示:{this.userInfo?.name}</h1>;
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(
            <div>
                <Detail />
            </div>,
            container
        );
        expect(consoleWarnSpy).toHaveBeenCalledWith('%s组件中多次注入%s，只需要注入一次就够了。', 'Detail', 'UserInfo');
    });
});
