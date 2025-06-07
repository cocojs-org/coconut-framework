import { render, registerApplication, unregisterApplication } from '../index';
import { Application, component } from 'coco-mvc'
import { getByRole, getByText, getRoles, waitFor } from '@testing-library/dom';
import * as ReactTestUtils from './test-units/ReactTestUnits';

let application
describe('ReactDOM', () => {
  beforeEach(() => {
    application = new Application();
    registerApplication(application);
  })

  afterEach(() => {
    unregisterApplication();
  })

  test('allows a DOM element to be used with a string', () => {
    application.start();
    const element = <div className={'foo'} />;
    const node = ReactTestUtils.renderIntoDocument(element);
    expect(node.tagName).toBe('DIV');
  });

  test('should bubble onSubmit', async () => {
    const container = document.createElement('p');
    let count = 0;
    let buttonRef;

    @component()
    class Parent {
      render(){
        return <div
          onSubmit={event => {
            // event.preventDefault();
            count++;
          }}>
          <Child />
        </div>
      }
    }

    @component()
    class Child {
      render() {
        return (
          <form role={'form'}>
            <input type="submit" ref={button => {buttonRef = button}} />
          </form>
        );
      }
    }

    application.start();
    document.body.appendChild(container);
    try {
      render(<Parent />, container);
      // todo jsdom没有实现requestSubmit，这里先不然form执行默认操作
      // 否则报Error: Not implemented: HTMLFormElement.prototype.requestSubmit
      const form = getByRole(container, 'form');
      form.addEventListener('submit', (e) => {
        e.preventDefault();
      });
      expect(buttonRef).toBeTruthy()
      buttonRef.click();
      await waitFor(async () => {
        expect(count).toBe(1);
      });
    } finally {
      document.body.removeChild(container);
    }
  });
})