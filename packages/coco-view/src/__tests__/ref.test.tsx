import { getByLabelText, getByRole, getByText, queryByTestId, waitFor } from '@testing-library/dom';

describe('ref', () => {
    let cocoMvc;
    let Application;
    let application;
    let view;
    let component;
    let bind;
    let ref;
    let Ref;
    let getMetaClassById;
    const mockFn = jest.fn();
    let consoleErrorSpy;
    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        jest.resetModules();
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        view = cocoMvc.view;
        bind = cocoMvc.bind;
        component = cocoMvc.component;
        ref = cocoMvc.ref;
        Ref = cocoMvc.Ref;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application();
        cocoMvc.registerMvcApi(application, getMetaClassById);
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
        jest.resetModules();
        consoleErrorSpy.mockRestore();
    });

    test('支持通过id获取Ref类', () => {
        application.start();
        const cls = getMetaClassById('Ref');
        expect(cls).toBe(Ref);
    });

    test('@ref装饰器不能装饰在class上', () => {
        @component()
        @ref()
        class Button {}

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10004：%s 类上class装饰器 %s 只能用于装饰%s',
            'Button',
            '@ref',
            'field'
        );
    });

    test('@ref装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @ref()
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@ref',
            'field'
        );
    });

    test('支持属性形式绑定浏览器标签或组件', () => {
        @view()
        class View {
            id() {
                return 'view-component';
            }

            render() {
                return <div>view</div>;
            }
        }
        @view()
        class Button {
            @bind()
            handleClick() {
                if (this.input.current && this.view.current) {
                    mockFn(this.input.current.id, this.view.current.id());
                }
            }

            @ref()
            input: { current: HTMLElement };

            @ref()
            view: { current: View };

            render() {
                return (
                    <div>
                        <button id={'id'} ref={this.input} onClick={this.handleClick}>
                            btn
                        </button>
                        <View ref={this.view} />
                    </div>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Button />, container);
        const button = getByRole(container, 'button');
        expect(button).toBeTruthy();
        expect(getByText(button, 'btn')).toBeTruthy();
        button.click();
        expect(mockFn).toHaveBeenCalledWith('id', 'view-component');
    });
});
