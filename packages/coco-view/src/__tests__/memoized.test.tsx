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
let getMetaClassById;
let consoleErrorSpy;
describe('memoized', () => {
    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        view = cocoMvc.view;
        reactive = cocoMvc.reactive;
        memoized = cocoMvc.memoized;
        component = cocoMvc.component;
        Memoized = cocoMvc.Memoized;
        bind = cocoMvc.bind;
        Application = cocoMvc.Application;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });

    afterEach(() => {
        consoleErrorSpy.mockRestore();
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
    });

    test('支持通过id获取Memoized类', () => {
        application.start();
        const cls = getMetaClassById('Memoized');
        expect(cls).toBe(Memoized);
    });

    test('@memoized装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @memoized('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@memoized',
            'method'
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
            'method'
        );
    });

    test('memoized直接依赖reactive，当reactive不变时，memoized不会重新计算', () => {
        const memoizedFn = jest.fn();

        @view()
        class Button {
            @reactive()
            count = 1;

            @memoized()
            score() {
                memoizedFn();
                return `${this.count}`;
            }

            @bind()
            onClick() {
                this.count = 2;
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
                        <button onClick={this.onClick}>click to update count</button>
                        <button onClick={this.onClickName}>click to update name</button>
                        {this.name}:{this.score()}
                    </div>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Button />, container);
        const buttons = queryAllByRole(container, 'button');
        expect(buttons.length).toBe(2);
        expect(buttons[0]).toBeTruthy();
        expect(buttons[1]).toBeTruthy();
        expect(getByText(container, '张三:1')).toBeTruthy();
        buttons[0].click();
        expect(getByText(container, '张三:2')).toBeTruthy();
        buttons[1].click();
        expect(getByText(container, '李四:2')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(2);
    });

    test('memoized依赖props的number类型属性，当props不变时，memoized不会重新计算', () => {
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
        // 渲染2次
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

    test('memoized依赖props的对象属性，当对象引用不变时，memoized不会重新计算', () => {
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
        // 渲染2次
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

    test('memoized a依赖reactive a，memoized b依赖memoized a，当reactive a更新时，memoized b也能更新', () => {
        const memoizedFn = jest.fn();

        @view()
        class Button {
            @reactive()
            count = 1;

            @memoized()
            score() {
                memoizedFn();
                return `${this.count}分`;
            }

            @memoized()
            myScore() {
                return `张三：${this.score()}`;
            }

            @bind()
            onClick() {
                this.count = 2;
            }

            render() {
                return (
                    <div>
                        <button onClick={this.onClick}>click to update count</button>
                        {this.myScore()}
                    </div>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Button />, container);
        const buttons = queryAllByRole(container, 'button');
        expect(buttons.length).toBe(1);
        expect(buttons[0]).toBeTruthy();
        expect(getByText(container, '张三：1分')).toBeTruthy();
        buttons[0].click();
        expect(getByText(container, '张三：2分')).toBeTruthy();
    });

    test('memoized取消依赖reactive时，再修改reactive，memoized不会重新计算', () => {
        const memoizedFn = jest.fn();

        @view()
        class Button {
            @reactive()
            showName = true;

            @bind()
            onClick() {
                this.showName = false;
            }

            @reactive()
            name = '张三';

            @bind()
            onChangeName() {
                this.name += '1';
            }

            @reactive()
            score = 1;

            @bind()
            onAddScore() {
                this.score += 1;
            }

            @memoized()
            myScore() {
                memoizedFn();
                if (this.showName) {
                    return `${this.name}:${this.score}分`;
                } else {
                    return `${this.score}分`;
                }
            }

            render() {
                return (
                    <div>
                        <button onClick={this.onClick}>click to hide name</button>
                        <button onClick={this.onChangeName}>click to change name</button>
                        <button onClick={this.onAddScore}>click to add score</button>
                        {this.myScore()}
                        <div>{this.name}</div>
                    </div>
                );
            }
        }
        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Button />, container);
        const buttons = queryAllByRole(container, 'button');
        expect(getByText(container, '张三:1分')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(1);
        buttons[1].click();
        expect(getByText(container, '张三1:1分')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(2);
        buttons[2].click();
        expect(getByText(container, '张三1:2分')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(3);
        buttons[0].click();
        expect(getByText(container, '2分')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(4);
        buttons[2].click();
        expect(getByText(container, '3分')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(5);
        buttons[1].click();
        expect(getByText(container, '3分')).toBeTruthy();
        expect(memoizedFn).toHaveBeenCalledTimes(5);
    });

    test('memoized a 依赖memoized b, memoized b取消依赖reactive，再修改reactive，memoized a也不会重新计算', () => {
        const memoizedFn1 = jest.fn();
        const memoizedFn2 = jest.fn();

        @view()
        class Button {
            @reactive()
            showName = true;

            @bind()
            onClick() {
                this.showName = false;
            }

            @reactive()
            name = '张三';

            @bind()
            onChangeName() {
                this.name += '1';
            }

            @reactive()
            score = 1;

            @bind()
            onAddScore() {
                this.score += 1;
            }

            @memoized()
            myScore() {
                memoizedFn1();
                if (this.showName) {
                    return `${this.name}:${this.score}`;
                } else {
                    return `${this.score}`;
                }
            }

            @memoized()
            myLabel() {
                memoizedFn2();
                return `${this.myScore()}分`;
            }

            render() {
                return (
                    <div>
                        <button onClick={this.onClick}>click to hide name</button>
                        <button onClick={this.onChangeName}>click to change name</button>
                        <button onClick={this.onAddScore}>click to add score</button>
                        {this.myLabel()}
                        <div>{this.name}</div>
                    </div>
                );
            }
        }
        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Button />, container);
        const buttons = queryAllByRole(container, 'button');
        expect(getByText(container, '张三:1分')).toBeTruthy();
        expect(memoizedFn1).toHaveBeenCalledTimes(1);
        expect(memoizedFn2).toHaveBeenCalledTimes(1);
        buttons[1].click();
        expect(getByText(container, '张三1:1分')).toBeTruthy();
        expect(memoizedFn1).toHaveBeenCalledTimes(2);
        expect(memoizedFn2).toHaveBeenCalledTimes(2);
        buttons[2].click();
        expect(getByText(container, '张三1:2分')).toBeTruthy();
        expect(memoizedFn1).toHaveBeenCalledTimes(3);
        expect(memoizedFn2).toHaveBeenCalledTimes(3);
        buttons[0].click();
        expect(getByText(container, '2分')).toBeTruthy();
        expect(memoizedFn1).toHaveBeenCalledTimes(4);
        expect(memoizedFn2).toHaveBeenCalledTimes(4);
        buttons[2].click();
        expect(getByText(container, '3分')).toBeTruthy();
        expect(memoizedFn1).toHaveBeenCalledTimes(5);
        expect(memoizedFn2).toHaveBeenCalledTimes(5);
        buttons[1].click();
        expect(getByText(container, '3分')).toBeTruthy();
        expect(memoizedFn1).toHaveBeenCalledTimes(5);
        expect(memoizedFn2).toHaveBeenCalledTimes(5);
    });
});
