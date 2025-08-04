import {
  getByLabelText,
  getByRole,
  getByText,
  queryByTestId,
  waitFor,
} from '@testing-library/dom';
import * as ReactTestUtils from './test-units/ReactTestUnits';

describe('ref', () => {
  let cocoMvc, Application, application, view, reactive, bind, ref;
  const mockFn = jest.fn();
  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = (await import('coco-mvc')).Application;
    view = (await import('coco-mvc')).view;
    bind = (await import('coco-mvc')).bind;
    reactive = (await import('coco-mvc')).reactive;
    ref = (await import('coco-mvc')).ref;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持属性形式绑定浏览器标签或组件', async () => {
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
