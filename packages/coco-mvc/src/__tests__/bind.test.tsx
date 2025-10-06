import {
  getByLabelText,
  getByRole,
  getByText,
  queryByTestId,
  waitFor,
} from '@testing-library/dom';

describe('decorator', () => {
  let cocoMvc, Application, application, view, reactive, bind, Bind;
  beforeEach(async () => {
    jest.resetModules();
    cocoMvc = await import('coco-mvc');
    Application = cocoMvc.Application;
    view = cocoMvc.view;
    bind = cocoMvc.bind;
    Bind = cocoMvc.Bind;
    reactive = cocoMvc.reactive;
    application = new Application();
    cocoMvc.registerApplication(application);
  });
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('支持通过id获取Bind类', () => {
    application.start();
    const cls = application.getMetadataCls('Bind');
    expect(cls).toBe(Bind);
  });

  test('正常渲染一个组件', () => {
    @view()
    class Button {
      @reactive()
      count = 1;

      label() {
        return `count:${this.count}`;
      }

      @bind()
      onClick() {
        this.count = 2;
      }

      render() {
        return <button onClick={this.onClick}>{this.label()}</button>;
      }
    }
    application.start();
    const container = document.createElement('div');
    cocoMvc.render(<Button />, container);
    const button = getByRole(container, 'button');
    expect(button).toBeTruthy();
    expect(getByText(button, 'count:1')).toBeTruthy();
    button.click();
    expect(getByText(button, 'count:2')).toBeTruthy();
  });
});
