import {
  getByLabelText,
  getByRole,
  getByText,
  queryByTestId,
  waitFor,
} from '@testing-library/dom';

describe('refs', () => {
  let cocoMvc, Application, application, view, reactive, bind, refs;
  const mockFn = jest.fn();
  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = (await import('coco-mvc')).Application;
    view = (await import('coco-mvc')).view;
    bind = (await import('coco-mvc')).bind;
    reactive = (await import('coco-mvc')).reactive;
    refs = (await import('coco-mvc')).refs;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持函数形式绑定host组件或自定义组件', async () => {
    @view()
    class View {
      id() {
        return 'view-component';
      }

      render() {
        return <div>view</div>;
      }
    }
    const btnKey = 1;
    const viewKey = 2;

    @view()
    class Button {
      @bind()
      handleClick() {
        if (this.refs[btnKey] && this.refs[viewKey]) {
          mockFn(this.refs[btnKey].id, (this.refs[viewKey] as View).id());
        }
      }

      @refs()
      refs: Record<number, HTMLElement | View>;

      render() {
        return (
          <div>
            <button
              id={'id'}
              ref={(elm) => (this.refs[btnKey] = elm)}
              onClick={this.handleClick}
            >
              btn
            </button>
            <View ref={(instance) => (this.refs[viewKey] = instance)} />
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
