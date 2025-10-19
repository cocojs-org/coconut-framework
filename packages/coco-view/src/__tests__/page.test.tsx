import { getByRole, getByText } from '@testing-library/dom';

describe('@page装饰器', () => {
    let cocoMvc;
    let Application;
    let application;
    let component;
    let page;
    let Page;
    let layout;
    let reactive;
    let getMetaClassById;
    let consoleErrorSpy;
    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        component = cocoMvc.component;
        page = cocoMvc.page;
        Page = cocoMvc.Page;
        layout = cocoMvc.layout;
        reactive = cocoMvc.reactive;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
        consoleErrorSpy.mockRestore();
    });

    test('支持通过id获取Page类', () => {
        application.start();
        const cls = getMetaClassById('Page');
        expect(cls).toBe(Page);
    });

    test('@page装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @page('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@page',
            'class'
        );
    });

    test('@page装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @page('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@page',
            'class'
        );
    });

    test('支持reactive装饰器来修改field字段，可以更新视图', () => {
        @page()
        class Counter {
            @reactive()
            value: number = 1;

            handleClick = () => {
                this.value++;
            };

            render() {
                return <button onClick={this.handleClick}>{this.value}</button>;
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Counter />, container);
        const button = getByRole(container, 'button');
        expect(button).toBeTruthy();
        expect(getByText(button, '1')).toBeTruthy();
        button.click();
        expect(getByText(button, '2')).toBeTruthy();
    });

    test('使用layout组件作为page组件的根节点，可以使用reactive装饰器更新视图', () => {
        @layout()
        class TestLayout {
            props: { header: any };

            render() {
                return <div>{this.props.header}</div>;
            }
        }
        @page()
        class Counter {
            @reactive()
            value: number = 1;

            handleClick = () => {
                this.value++;
            };

            render() {
                return <TestLayout header={<button onClick={this.handleClick}>{this.value}</button>}></TestLayout>;
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Counter />, container);
        const button = getByRole(container, 'button');
        expect(button).toBeTruthy();
        expect(getByText(button, '1')).toBeTruthy();
        button.click();
        expect(getByText(button, '2')).toBeTruthy();
    });
});
