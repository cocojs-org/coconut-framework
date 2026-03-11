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

    test('@memoized装饰器支持装饰在字段上，但字段必须有函数类型的初始值', () => {
        @component()
        class Button {
            @memoized()
            onClick: string = 'not function';
        }

        application.start();
        application.getComponent(Button);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10028：Button 类 onClick 字段上memoized装饰器，但 onClick 的值必须是函数，不能是 string',
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
            'method,field'
        );
    });
});

describe('@memoized和props的联动功能', () => {
    let Application;
    let application;
    let cocoMvc;
    let view;
    let component;
    let Reactive;
    let reactive;
    let memoized;
    let bind;
    let consoleWarnSpy;
    let consoleErrorSpy;
    beforeEach(async () => {
        cocoMvc = await import('@cocojs/mvc');
        view = cocoMvc.view;
        component = cocoMvc.component;
        Reactive = cocoMvc.Reactive;
        reactive = cocoMvc.reactive;
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

    test('memoized依赖props的number类型属性，当props不变时，memoized不会重新计算--method', () => {
        const memoizedFn = jest.fn();

        @view()
        class Button {
            props: { count: number };

            @memoized()
            score() {
                memoizedFn();
                return `${this.props.count}`;
            }

            @reactive()
            name = '张三';

            @bind()
            onClickName() {
                this.name = '李四';
            }

            render() {
                return (
                    <div>
                        <button>click to update count</button>
                        <button onClick={this.onClickName}>click to update name</button>
                        {this.name}:{this.score()}
                    </div>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        // 渲染2次，因为count没有变化，所以memoized只渲染了一次
        cocoMvc.renderIntoContainer(<Button count={1} />, container);
        cocoMvc.renderIntoContainer(<Button count={1} />, container);
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        const buttons = queryAllByRole(container, 'button');
        expect(buttons.length).toBe(2);
        expect(getByText(container, '张三:1')).toBeTruthy();
        cocoMvc.renderIntoContainer(<Button count={2} />, container);
        // 修改props.count，所以memoizedFn重新计算
        expect(memoizedFn).toHaveBeenCalledTimes(2);
        expect(getByText(container, '张三:2')).toBeTruthy();
        buttons[1].click();
        // 没有修改props.count，所以memoizedFn使用缓存
        expect(memoizedFn).toHaveBeenCalledTimes(2);
        expect(getByText(container, '李四:2')).toBeTruthy();
    });

    test('memoized依赖props的number类型属性，当props不变时，memoized不会重新计算--field箭头函数', () => {
        const memoizedFn = jest.fn();

        @view()
        class Button {
            props: { count: number };

            @memoized()
            score = () => {
                memoizedFn();
                return `${this.props.count}`;
            };

            @reactive()
            name = '张三';

            @bind()
            onClickName() {
                this.name = '李四';
            }

            render() {
                return (
                    <div>
                        <button>click to update count</button>
                        <button onClick={this.onClickName}>click to update name</button>
                        {this.name}:{this.score()}
                    </div>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        // 渲染2次，因为count没有变化，所以memoized只渲染了一次
        cocoMvc.renderIntoContainer(<Button count={1} />, container);
        cocoMvc.renderIntoContainer(<Button count={1} />, container);
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        const buttons = queryAllByRole(container, 'button');
        expect(buttons.length).toBe(2);
        expect(getByText(container, '张三:1')).toBeTruthy();
        cocoMvc.renderIntoContainer(<Button count={2} />, container);
        // 修改props.count，所以memoizedFn重新计算
        expect(memoizedFn).toHaveBeenCalledTimes(2);
        expect(getByText(container, '张三:2')).toBeTruthy();
        buttons[1].click();
        // 没有修改props.count，所以memoizedFn使用缓存
        expect(memoizedFn).toHaveBeenCalledTimes(2);
        expect(getByText(container, '李四:2')).toBeTruthy();
    });

    test('memoized依赖props的number类型属性，当props不变时，memoized不会重新计算--field普通函数', () => {
        const memoizedFn = jest.fn();

        @view()
        class Button {
            props: { count: number };

            @memoized()
            score = function(){
                memoizedFn();
                return `${this.props.count}`;
            };

            @reactive()
            name = '张三';

            @bind()
            onClickName() {
                this.name = '李四';
            }

            render() {
                return (
                    <div>
                        <button>click to update count</button>
                        <button onClick={this.onClickName}>click to update name</button>
                        {this.name}:{this.score()}
                    </div>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        // 渲染2次，因为count没有变化，所以memoized只渲染了一次
        cocoMvc.renderIntoContainer(<Button count={1} />, container);
        cocoMvc.renderIntoContainer(<Button count={1} />, container);
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        const buttons = queryAllByRole(container, 'button');
        expect(buttons.length).toBe(2);
        expect(getByText(container, '张三:1')).toBeTruthy();
        cocoMvc.renderIntoContainer(<Button count={2} />, container);
        // 修改props.count，所以memoizedFn重新计算
        expect(memoizedFn).toHaveBeenCalledTimes(2);
        expect(getByText(container, '张三:2')).toBeTruthy();
        buttons[1].click();
        // 没有修改props.count，所以memoizedFn使用缓存
        expect(memoizedFn).toHaveBeenCalledTimes(2);
        expect(getByText(container, '李四:2')).toBeTruthy();
    });

    test('memoized依赖props的对象属性，当对象引用不变时，memoized不会重新计算--method', () => {
        const memoizedFn = jest.fn();

        const user1 = { count: 1 };
        const user2 = { count: 2 };

        @view()
        class Button {
            props: { user: { count: number } };

            @memoized()
            score() {
                memoizedFn();
                return `${this.props.user.count}`;
            }

            @reactive()
            name = '张三';

            @bind()
            onClickName() {
                this.name = '李四';
            }

            render() {
                return (
                    <div>
                        <button onClick={this.onClickName}>click to update name</button>
                        {this.name}:{this.score()}
                    </div>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        // 渲染2次，但prop的引用的对象一直是user1
        cocoMvc.renderIntoContainer(<Button user={user1} />, container);
        cocoMvc.renderIntoContainer(<Button user={user1} />, container);
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        const buttons = queryAllByRole(container, 'button');
        expect(getByText(container, '张三:1')).toBeTruthy();
        cocoMvc.renderIntoContainer(<Button user={user2} />, container);
        // 修改props.user，所以memoizedFn重新计算
        expect(memoizedFn).toHaveBeenCalledTimes(2);
        expect(getByText(container, '张三:2')).toBeTruthy();
        buttons[0].click();
        // 没有修改props.user，所以memoizedFn使用缓存
        expect(memoizedFn).toHaveBeenCalledTimes(2);
        expect(getByText(container, '李四:2')).toBeTruthy();
    });

    test('memoized依赖props的对象属性，当对象引用不变时，memoized不会重新计算--field箭头函数', () => {
        const memoizedFn = jest.fn();

        const user1 = { count: 1 };
        const user2 = { count: 2 };

        @view()
        class Button {
            props: { user: { count: number } };

            @memoized()
            score = () => {
                memoizedFn();
                return `${this.props.user.count}`;
            };

            @reactive()
            name = '张三';

            @bind()
            onClickName() {
                this.name = '李四';
            }

            render() {
                return (
                    <div>
                        <button onClick={this.onClickName}>click to update name</button>
                        {this.name}:{this.score()}
                    </div>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        // 渲染2次，但prop的引用的对象一直是user1
        cocoMvc.renderIntoContainer(<Button user={user1} />, container);
        cocoMvc.renderIntoContainer(<Button user={user1} />, container);
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        const buttons = queryAllByRole(container, 'button');
        expect(getByText(container, '张三:1')).toBeTruthy();
        cocoMvc.renderIntoContainer(<Button user={user2} />, container);
        // 修改props.user，所以memoizedFn重新计算
        expect(memoizedFn).toHaveBeenCalledTimes(2);
        expect(getByText(container, '张三:2')).toBeTruthy();
        buttons[0].click();
        // 没有修改props.user，所以memoizedFn使用缓存
        expect(memoizedFn).toHaveBeenCalledTimes(2);
        expect(getByText(container, '李四:2')).toBeTruthy();
    });

    test('memoized依赖props的对象属性，当对象引用不变时，memoized不会重新计算--field普通函数', () => {
        const memoizedFn = jest.fn();

        const user1 = { count: 1 };
        const user2 = { count: 2 };

        @view()
        class Button {
            props: { user: { count: number } };

            @memoized()
            score = function() {
                memoizedFn();
                return `${this.props.user.count}`;
            };

            @reactive()
            name = '张三';

            @bind()
            onClickName() {
                this.name = '李四';
            }

            render() {
                return (
                    <div>
                        <button onClick={this.onClickName}>click to update name</button>
                        {this.name}:{this.score()}
                    </div>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        // 渲染2次，但prop的引用的对象一直是user1
        cocoMvc.renderIntoContainer(<Button user={user1} />, container);
        cocoMvc.renderIntoContainer(<Button user={user1} />, container);
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        const buttons = queryAllByRole(container, 'button');
        expect(getByText(container, '张三:1')).toBeTruthy();
        cocoMvc.renderIntoContainer(<Button user={user2} />, container);
        // 修改props.user，所以memoizedFn重新计算
        expect(memoizedFn).toHaveBeenCalledTimes(2);
        expect(getByText(container, '张三:2')).toBeTruthy();
        buttons[0].click();
        // 没有修改props.user，所以memoizedFn使用缓存
        expect(memoizedFn).toHaveBeenCalledTimes(2);
        expect(getByText(container, '李四:2')).toBeTruthy();
    });

    test('memoized-a依赖memoized-b，memoized-b重新计算会引起memoized-b重新计算--method', () => {
        const memoizedFn1 = jest.fn();
        const memoizedFn2 = jest.fn();

        @view()
        class Button {
            props: { count: number };

            @memoized()
            score() {
                memoizedFn1();
                return `${this.props.count}`;
            }

            @memoized()
            scoreLabel() {
                memoizedFn2();
                return `${this.score()}分`;
            }

            @reactive()
            name = '张三';

            @bind()
            onClickName() {
                this.name = '李四';
            }

            render() {
                return (
                    <div>
                        <button>click to update count</button>
                        <button onClick={this.onClickName}>click to update name</button>
                        {this.name}:{this.scoreLabel()}
                    </div>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        // 渲染2次，因为count没有变化，所以memoized只渲染了一次
        cocoMvc.renderIntoContainer(<Button count={1} />, container);
        cocoMvc.renderIntoContainer(<Button count={1} />, container);
        expect(memoizedFn1).toHaveBeenCalledTimes(1);
        expect(memoizedFn2).toHaveBeenCalledTimes(1);
        const buttons = queryAllByRole(container, 'button');
        expect(buttons.length).toBe(2);
        expect(getByText(container, '张三:1分')).toBeTruthy();

        // 修改props.count，所以memoizedFn重新计算
        cocoMvc.renderIntoContainer(<Button count={2} />, container);
        expect(memoizedFn1).toHaveBeenCalledTimes(2);
        expect(memoizedFn2).toHaveBeenCalledTimes(2);
        expect(getByText(container, '张三:2分')).toBeTruthy();

        // 没有修改props.count，所以memoizedFn使用缓存
        buttons[1].click();
        expect(memoizedFn1).toHaveBeenCalledTimes(2);
        expect(memoizedFn2).toHaveBeenCalledTimes(2);
        expect(getByText(container, '李四:2分')).toBeTruthy();
    });

    test('memoized-a依赖memoized-b，memoized-b重新计算会引起memoized-b重新计算--field箭头函数', () => {
        const memoizedFn1 = jest.fn();
        const memoizedFn2 = jest.fn();

        @view()
        class Button {
            props: { count: number };

            @memoized()
            score = () => {
                memoizedFn1();
                return `${this.props.count}`;
            };

            @memoized()
            scoreLabel = () => {
                memoizedFn2();
                return `${this.score()}分`;
            };

            @reactive()
            name = '张三';

            @bind()
            onClickName() {
                this.name = '李四';
            }

            render() {
                return (
                    <div>
                        <button>click to update count</button>
                        <button onClick={this.onClickName}>click to update name</button>
                        {this.name}:{this.scoreLabel()}
                    </div>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        // 渲染2次，因为count没有变化，所以memoized只渲染了一次
        cocoMvc.renderIntoContainer(<Button count={1} />, container);
        cocoMvc.renderIntoContainer(<Button count={1} />, container);
        expect(memoizedFn1).toHaveBeenCalledTimes(1);
        expect(memoizedFn2).toHaveBeenCalledTimes(1);
        const buttons = queryAllByRole(container, 'button');
        expect(buttons.length).toBe(2);
        expect(getByText(container, '张三:1分')).toBeTruthy();

        // 修改props.count，所以memoizedFn重新计算
        cocoMvc.renderIntoContainer(<Button count={2} />, container);
        expect(memoizedFn1).toHaveBeenCalledTimes(2);
        expect(memoizedFn2).toHaveBeenCalledTimes(2);
        expect(getByText(container, '张三:2分')).toBeTruthy();

        // 没有修改props.count，所以memoizedFn使用缓存
        buttons[1].click();
        expect(memoizedFn1).toHaveBeenCalledTimes(2);
        expect(memoizedFn2).toHaveBeenCalledTimes(2);
        expect(getByText(container, '李四:2分')).toBeTruthy();
    });

    test('memoized-a依赖memoized-b，memoized-b重新计算会引起memoized-b重新计算--field普通函数', () => {
        const memoizedFn1 = jest.fn();
        const memoizedFn2 = jest.fn();

        @view()
        class Button {
            props: { count: number };

            @memoized()
            score = function() {
                memoizedFn1();
                return `${this.props.count}`;
            };

            @memoized()
            scoreLabel = function () {
                memoizedFn2();
                return `${this.score()}分`;
            };

            @reactive()
            name = '张三';

            @bind()
            onClickName() {
                this.name = '李四';
            }

            render() {
                return (
                    <div>
                        <button>click to update count</button>
                        <button onClick={this.onClickName}>click to update name</button>
                        {this.name}:{this.scoreLabel()}
                    </div>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        // 渲染2次，因为count没有变化，所以memoized只渲染了一次
        cocoMvc.renderIntoContainer(<Button count={1} />, container);
        cocoMvc.renderIntoContainer(<Button count={1} />, container);
        expect(memoizedFn1).toHaveBeenCalledTimes(1);
        expect(memoizedFn2).toHaveBeenCalledTimes(1);
        const buttons = queryAllByRole(container, 'button');
        expect(buttons.length).toBe(2);
        expect(getByText(container, '张三:1分')).toBeTruthy();

        // 修改props.count，所以memoizedFn重新计算
        cocoMvc.renderIntoContainer(<Button count={2} />, container);
        expect(memoizedFn1).toHaveBeenCalledTimes(2);
        expect(memoizedFn2).toHaveBeenCalledTimes(2);
        expect(getByText(container, '张三:2分')).toBeTruthy();

        // 没有修改props.count，所以memoizedFn使用缓存
        buttons[1].click();
        expect(memoizedFn1).toHaveBeenCalledTimes(2);
        expect(memoizedFn2).toHaveBeenCalledTimes(2);
        expect(getByText(container, '李四:2分')).toBeTruthy();
    });

    test('修改自身状态但memoized没有引用时，memoized不会重新计算--method', () => {
        const memoizedFn = jest.fn();

        @view()
        class Child {
            props: {
                count: number;
                updateCount: () => {};
            };

            @memoized()
            score() {
                memoizedFn();
                return `${this.props.count}`;
            }

            @reactive()
            name = '张三';

            @bind()
            onClickName() {
                this.name = '李四';
            }

            render() {
                return (
                    <div>
                        <button onClick={this.props.updateCount}>click to update count</button>
                        <button onClick={this.onClickName}>click to update name</button>
                        {this.name}:{this.score()}
                    </div>
                );
            }
        }

        @view()
        class Parent {
            @reactive()
            count = 1;

            @bind()
            updateCount() {
                this.count++;
            }

            render() {
                return <Child count={this.count} updateCount={this.updateCount} />;
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Parent />, container);
        const buttons = queryAllByRole(container, 'button');
        expect(buttons.length).toBe(2);
        expect(buttons[0]).toBeTruthy();
        expect(getByText(container, '张三:1')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        buttons[1].click();
        expect(getByText(container, '李四:1')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        buttons[0].click();
        expect(getByText(container, '李四:2')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(2);
    });

    test('修改自身状态但memoized没有引用时，memoized不会重新计算--field箭头函数', () => {
        const memoizedFn = jest.fn();

        @view()
        class Child {
            props: {
                count: number;
                updateCount: () => {};
            };

            @memoized()
            score = () => {
                memoizedFn();
                return `${this.props.count}`;
            };

            @reactive()
            name = '张三';

            @bind()
            onClickName() {
                this.name = '李四';
            }

            render() {
                return (
                    <div>
                        <button onClick={this.props.updateCount}>click to update count</button>
                        <button onClick={this.onClickName}>click to update name</button>
                        {this.name}:{this.score()}
                    </div>
                );
            }
        }

        @view()
        class Parent {
            @reactive()
            count = 1;

            @bind()
            updateCount() {
                this.count++;
            }

            render() {
                return <Child count={this.count} updateCount={this.updateCount} />;
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Parent />, container);
        const buttons = queryAllByRole(container, 'button');
        expect(buttons.length).toBe(2);
        expect(buttons[0]).toBeTruthy();
        expect(getByText(container, '张三:1')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        buttons[1].click();
        expect(getByText(container, '李四:1')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        buttons[0].click();
        expect(getByText(container, '李四:2')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(2);
    });

    test('修改自身状态但memoized没有引用时，memoized不会重新计算--field普通函数', () => {
        const memoizedFn = jest.fn();

        @view()
        class Child {
            props: {
                count: number;
                updateCount: () => {};
            };

            @memoized()
            score = function () {
                memoizedFn();
                return `${this.props.count}`;
            };

            @reactive()
            name = '张三';

            @bind()
            onClickName() {
                this.name = '李四';
            }

            render() {
                return (
                    <div>
                        <button onClick={this.props.updateCount}>click to update count</button>
                        <button onClick={this.onClickName}>click to update name</button>
                        {this.name}:{this.score()}
                    </div>
                );
            }
        }

        @view()
        class Parent {
            @reactive()
            count = 1;

            @bind()
            updateCount() {
                this.count++;
            }

            render() {
                return <Child count={this.count} updateCount={this.updateCount} />;
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Parent />, container);
        const buttons = queryAllByRole(container, 'button');
        expect(buttons.length).toBe(2);
        expect(buttons[0]).toBeTruthy();
        expect(getByText(container, '张三:1')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        buttons[1].click();
        expect(getByText(container, '李四:1')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        buttons[0].click();
        expect(getByText(container, '李四:2')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(2);
    });

    test('非memoized依赖的 props 发生修改时，memoized不会重新计算--method', () => {
        const memoizedFn = jest.fn();

        @view()
        class Child {
            props: {
                count: number;
                updateCount: () => void;
                name: number;
                updateName: () => void;
            };

            @memoized()
            score() {
                memoizedFn();
                return `${this.props.count}`;
            }

            render() {
                return (
                    <div>
                        <button onClick={this.props.updateCount}>click to update count</button>
                        <button onClick={this.props.updateName}>click to update name</button>
                        {this.props.name}:{this.score()}
                    </div>
                );
            }
        }

        @view()
        class Parent {
            @reactive()
            count = 1;
            @bind()
            updateCount() {
                this.count++;
            }

            @reactive()
            name = '张三';
            @bind()
            updateName() {
                this.name = '李四';
            }

            render() {
                return (
                    <Child
                        count={this.count}
                        updateCount={this.updateCount}
                        name={this.name}
                        updateName={this.updateName}
                    />
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Parent />, container);
        const buttons = queryAllByRole(container, 'button');
        expect(buttons.length).toBe(2);
        expect(buttons[0]).toBeTruthy();
        expect(getByText(container, '张三:1')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        buttons[1].click();
        expect(getByText(container, '李四:1')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        buttons[0].click();
        expect(getByText(container, '李四:2')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(2);
    });

    test('非memoized依赖的 props 发生修改时，memoized不会重新计算--field箭头函数', () => {
        const memoizedFn = jest.fn();

        @view()
        class Child {
            props: {
                count: number;
                updateCount: () => void;
                name: number;
                updateName: () => void;
            };

            @memoized()
            score = () => {
                memoizedFn();
                return `${this.props.count}`;
            };

            render() {
                return (
                    <div>
                        <button onClick={this.props.updateCount}>click to update count</button>
                        <button onClick={this.props.updateName}>click to update name</button>
                        {this.props.name}:{this.score()}
                    </div>
                );
            }
        }

        @view()
        class Parent {
            @reactive()
            count = 1;
            @bind()
            updateCount() {
                this.count++;
            }

            @reactive()
            name = '张三';
            @bind()
            updateName() {
                this.name = '李四';
            }

            render() {
                return (
                    <Child
                        count={this.count}
                        updateCount={this.updateCount}
                        name={this.name}
                        updateName={this.updateName}
                    />
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Parent />, container);
        const buttons = queryAllByRole(container, 'button');
        expect(buttons.length).toBe(2);
        expect(buttons[0]).toBeTruthy();
        expect(getByText(container, '张三:1')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        buttons[1].click();
        expect(getByText(container, '李四:1')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        buttons[0].click();
        expect(getByText(container, '李四:2')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(2);
    });

    test('非memoized依赖的 props 发生修改时，memoized不会重新计算--field普通函数', () => {
        const memoizedFn = jest.fn();

        @view()
        class Child {
            props: {
                count: number;
                updateCount: () => void;
                name: number;
                updateName: () => void;
            };

            @memoized()
            score = function (){
                memoizedFn();
                return `${this.props.count}`;
            };

            render() {
                return (
                    <div>
                        <button onClick={this.props.updateCount}>click to update count</button>
                        <button onClick={this.props.updateName}>click to update name</button>
                        {this.props.name}:{this.score()}
                    </div>
                );
            }
        }

        @view()
        class Parent {
            @reactive()
            count = 1;
            @bind()
            updateCount() {
                this.count++;
            }

            @reactive()
            name = '张三';
            @bind()
            updateName() {
                this.name = '李四';
            }

            render() {
                return (
                    <Child
                        count={this.count}
                        updateCount={this.updateCount}
                        name={this.name}
                        updateName={this.updateName}
                    />
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Parent />, container);
        const buttons = queryAllByRole(container, 'button');
        expect(buttons.length).toBe(2);
        expect(buttons[0]).toBeTruthy();
        expect(getByText(container, '张三:1')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        buttons[1].click();
        expect(getByText(container, '李四:1')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        buttons[0].click();
        expect(getByText(container, '李四:2')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(2);
    });
});
