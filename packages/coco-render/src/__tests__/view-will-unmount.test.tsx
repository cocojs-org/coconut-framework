import { getByRole, getByText, waitFor } from '@testing-library/dom';

export const buttonWillUnmount = jest.fn();

let Application;
let application;
let cocoMvc;
let view;
let reactive;
let bind;
describe('viewWillUnmount', () => {
  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    view = cocoMvc.view;
    reactive = cocoMvc.reactive;
    bind = cocoMvc.bind;
    Application = cocoMvc.Application;
    application = new Application();
    cocoMvc.registerApplication(application);
  });

  afterEach(async () => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('viewWillUnmount被调用', async () => {
    @view()
    class Button {
      @reactive()
      count = 1;

      viewWillUnmount() {
        buttonWillUnmount();
      }

      render() {
        return <button>count:{this.count}</button>;
      }
    }

    @view()
    class App {
      @reactive()
      show: boolean = true;

      @bind()
      handleClick() {
        this.show = false;
      }

      render() {
        return (
          <h1 onClick={this.handleClick}>
            {this.show ? <Button /> : 'not show'}
          </h1>
        );
      }
    }
    application.start();
    const container = document.createElement('div');
    cocoMvc.render(<App />, container);
    const header = getByRole(container, 'heading');
    const button = getByRole(header, 'button');
    expect(button).toBeTruthy();
    expect(getByText(button, 'count:1')).toBeTruthy();
    header.click();
    await waitFor(() => {
      expect(getByText(header, 'not show')).toBeTruthy();
      expect(buttonWillUnmount).toHaveBeenCalledTimes(1);
    });
  });
});
