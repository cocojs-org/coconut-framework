import {
  getByLabelText,
  getByRole,
  getByText,
  queryByTestId,
  waitFor,
} from '@testing-library/dom';
import * as ReactTestUtils from './test-units/ReactTestUnits';

describe('decorator', () => {
  let cocoMvc, Application, application, view, reactive, bind;
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

  test('正常渲染一个组件', async () => {
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
