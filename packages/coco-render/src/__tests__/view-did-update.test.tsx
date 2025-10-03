import { getByRole, getByText, waitFor } from '@testing-library/dom';

const appDidMount = jest.fn();
const buttonDidUpdate = jest.fn();

let Application;
let application;
let cocoMvc;
let view;
let reactive;
let bind;
describe('viewDidUpdate', () => {
  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    view = cocoMvc.view;
    reactive = cocoMvc.reactive;
    bind = cocoMvc.bind;
    Application = cocoMvc.Application;
    application = new Application();
    cocoMvc.registerApplication(application);
  });

  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('App的viewDidMount被调用', () => {
    @view()
    class Button {
      @reactive()
      count = 1;

      @bind()
      onClick() {
        this.count = 2;
      }

      viewDidUpdate(prevProps, { count: prevCount }) {
        buttonDidUpdate(prevCount);
      }

      render() {
        return <button onClick={this.onClick}>count:{this.count}</button>;
      }
    }

    @view()
    class App {
      viewDidMount() {
        appDidMount();
      }

      render() {
        return (
          <h1>
            <Button />
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
    expect(appDidMount).toHaveBeenCalledTimes(1);
    button.click();
    expect(getByText(button, 'count:2')).toBeTruthy();
    expect(buttonDidUpdate).toHaveBeenCalledTimes(1);
    expect(buttonDidUpdate).toHaveBeenCalledWith(1);
  });
});
