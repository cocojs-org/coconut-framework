import { getByText, queryAllByRole } from '@testing-library/dom';

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
        cocoMvc = await import('coco-mvc');
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

    test('如果prop变化，memoized会重新计算', () => {
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

            name = '张三';

            render() {
                return (
                    <div>
                        <button onClick={this.props.updateCount}>click to update count</button>
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
        expect(buttons.length).toBe(1);
        expect(buttons[0]).toBeTruthy();
        expect(getByText(container, '张三:1')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        buttons[0].click();
        expect(getByText(container, '张三:2')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(2);
        buttons[0].click();
        expect(getByText(container, '张三:3')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(3);
    });

    test('修改自身状态但memoized没有引用时，memoized不会重新计算', () => {
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

    test('非memoized依赖的 props 发生修改时，memoized不会重新计算', () => {
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
});
