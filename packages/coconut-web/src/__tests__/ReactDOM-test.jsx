import { render, registerApplication, unregisterApplication } from '../index';
import { Application, component } from 'coco-mvc'
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
    const element = <div className={'foo'} />;
    application.start();
    const node = ReactTestUtils.renderIntoDocument(element);
    expect(node.tagName).toBe('DIV');
  });

  xtest('should bubble onSubmit', () => {
    const container = document.createElement('div');
    let count = 0;
    let buttonRef;

    @component()
    class Parent {
      render(){
        return <div
          onSubmit={event => {
            event.preventDefault();
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
          <form>
            <input type="submit" ref={button => (buttonRef = button)} />
          </form>
        );
      }
    }

    application.start();
    document.body.appendChild(container);
    try {
      render(<Parent />, container);
      buttonRef.click();
      console.info('eeee', container.innerHTML);
      expect(count).toBe(1);
    } finally {
      document.body.removeChild(container);
    }
  });
})