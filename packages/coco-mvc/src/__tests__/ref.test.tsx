import {
  getByLabelText,
  getByRole,
  getByText,
  queryByTestId,
  waitFor,
} from '@testing-library/dom';

describe('ref', () => {
  let cocoMvc;
  let Application;
  let application;
  let view;
  let reactive;
  let bind;
  let ref;
  let Ref;
  let getMetaClassById;
  const mockFn = jest.fn();
  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    view = cocoMvc.view;
    bind = cocoMvc.bind;
    reactive = cocoMvc.reactive;
    ref = cocoMvc.ref;
    Ref = cocoMvc.Ref;
    getMetaClassById = cocoMvc.getMetaClassById;
    application = new Application();
    cocoMvc.registerApplication(application, getMetaClassById);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取Ref类', () => {
    application.start();
    const cls = getMetaClassById('Ref');
    expect(cls).toBe(Ref);
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
    cocoMvc.render(<Button />, container);
    const button = getByRole(container, 'button');
    expect(button).toBeTruthy();
    expect(getByText(button, 'btn')).toBeTruthy();
    button.click();
    expect(mockFn).toHaveBeenCalledWith('id', 'view-component');
  });
});
