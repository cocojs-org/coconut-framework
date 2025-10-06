import {
  getByLabelText,
  getByRole,
  getByText,
  queryByTestId,
  waitFor,
} from '@testing-library/dom';

describe('refs', () => {
  let cocoMvc;
  let Application;
  let application;
  let view;
  let reactive;
  let bind;
  let refs;
  let Refs;
  let getMetaClassById;
  const mockFn = jest.fn();
  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    view = cocoMvc.view;
    bind = cocoMvc.bind;
    reactive = cocoMvc.reactive;
    refs = cocoMvc.refs;
    Refs = cocoMvc.Refs;
    getMetaClassById = cocoMvc.getMetaClassById;
    application = new Application();
    cocoMvc.registerApplication(application, getMetaClassById);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取Refs类', () => {
    application.start();
    const cls = getMetaClassById('Refs');
    expect(cls).toBe(Refs);
  });

  test('支持函数形式绑定host组件或自定义组件', () => {
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
