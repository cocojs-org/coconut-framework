/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 *
 * packages/react-dom/src/__tests__/ReactDOMInput-test.js
 */

'use strict';

describe('ReactDOMInput', () => {
  let cocoMvc, Application, application, jsx, view, reactive, ref, container, consoleErrorSpy, setUntrackedValue, setUntrackedChecked;

  function dispatchEventOnNode(node, type) {
    node.dispatchEvent(new Event(type, {bubbles: true, cancelable: true}));
  }

  beforeEach(async () => {
    jest.resetModules();

    setUntrackedValue = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'value',
    ).set;
    setUntrackedChecked = Object.getOwnPropertyDescriptor(
      HTMLInputElement.prototype,
      'checked',
    ).set;

    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {})

    cocoMvc = (await import('coco-mvc'));
    Application = (await import('coco-mvc')).Application;
    view = (await import('coco-mvc')).view;
    reactive = (await import('coco-mvc')).reactive;
    ref = (await import('coco-mvc')).ref;
    jsx = (await import('coco-mvc/jsx-runtime')).jsx;
    application = new Application();
    cocoMvc.registerApplication(application);

    container = document.createElement('div');
    document.body.appendChild(container);
  })
  afterEach(() => {
    document.body.removeChild(container);
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    consoleErrorSpy.mockRestore();
  })

  it('should warn for controlled value of 0 with missing onChange', () => {
    cocoMvc.render(<input type="text" value={0} />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.',
    );
  });

  it('should warn for controlled value of "" with missing onChange', () => {
    cocoMvc.render(<input type="text" value="" />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.',
    );
  });

  it('should warn for controlled value of "0" with missing onChange', () => {
    cocoMvc.render(<input type="text" value="0" />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.',
    );
  });

  it('should warn for controlled value of false with missing onChange', () => {
    cocoMvc.render(<input type="checkbox" checked={false} />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.',
    );
  });

  it('should warn with checked and no onChange handler with readOnly specified', () => {
    cocoMvc.render(
      <input type="checkbox" checked={false} readOnly={true} />,
      container,
    );
    cocoMvc.unmountComponentAtNode(container);

    cocoMvc.render(
      <input type="checkbox" checked={false} readOnly={false} />,
      container,
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'You provided a `checked` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultChecked`. Otherwise, set either `onChange` or `readOnly`.',
    );
  });

  it('should not warn about missing onChange in uncontrolled inputs', () => {
    cocoMvc.render(<input />, container);
    cocoMvc.unmountComponentAtNode(container);
    cocoMvc.render(<input value={undefined} />, container);
    cocoMvc.unmountComponentAtNode(container);
    cocoMvc.render(<input type="text" />, container);
    cocoMvc.unmountComponentAtNode(container);
    cocoMvc.render(<input type="text" value={undefined} />, container);
    cocoMvc.unmountComponentAtNode(container);
    cocoMvc.render(<input type="checkbox" />, container);
    cocoMvc.unmountComponentAtNode(container);
    cocoMvc.render(<input type="checkbox" checked={undefined} />, container);
  });

  it('should not warn with value and onInput handler', () => {
    cocoMvc.render(<input value="..." onInput={() => {}} />, container);
  });

  it('should properly control a value even if no event listener exists', () => {
    let node;
    node = cocoMvc.render(<input type="text" value="lion" />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.',
    );

    setUntrackedValue.call(node, 'giraffe');

    // This must use the native event dispatching. If we simulate, we will
    // bypass the lazy event attachment system so we won't actually test this.
    dispatchEventOnNode(node, 'input');

    expect(node.value).toBe('lion');
  });

  it('should control a value in reentrant events', () => {
    @view()
    class ControlledInputs {
      @reactive()
      state = 'lion';
      a = null;
      b = null;
      switchedFocus = false;

      change(newValue) {
        this.state = newValue;
        // Calling focus here will blur the text box which causes a native
        // change event. Ideally we shouldn't have to fire this ourselves.
        // Don't remove unless you've verified the fix in #8240 is still covered.
        dispatchEventOnNode(this.a, 'input');
        this.b.focus();
      }

      blur(currentValue) {
        this.switchedFocus = true;
        // currentValue should be 'giraffe' here because we should not have
        // restored it on the target yet.
        this.state = currentValue;
      }

      render() {
        return (
          <div>
            <input
              type="text"
              ref={n => (this.a = n)}
              value={this.state.value}
              onChange={e => this.change(e.target.value)}
              onBlur={e => this.blur(e.target.value)}
            />
            <input type="text" ref={n => (this.b = n)} />
          </div>
        );
      }
    }

    application.start();
    const instance = cocoMvc.render(<ControlledInputs />, container);

    // Focus the field so we can later blur it.
    // Don't remove unless you've verified the fix in #8240 is still covered.
    instance.a.focus();
    setUntrackedValue.call(instance.a, 'giraffe');
    // This must use the native event dispatching. If we simulate, we will
    // bypass the lazy event attachment system so we won't actually test this.
    dispatchEventOnNode(instance.a, 'input');
    dispatchEventOnNode(instance.a, 'blur');
    dispatchEventOnNode(instance.a, 'focusout');

    expect(instance.a.value).toBe('giraffe');
    expect(instance.switchedFocus).toBe(true);
  });

  it('should control values in reentrant events with different targets', () => {
    @view()
    class ControlledInputs {
      @reactive()
      state = 'lion';

      a = null;
      b = null;
      change(newValue) {
        // This click will change the checkbox's value to false. Then it will
        // invoke an inner change event. When we finally, flush, we need to
        // reset the checkbox's value to true since that is its controlled
        // value.
        this.b.click();
      }
      render() {
        return (
          <div>
            <input
              type="text"
              ref={n => (this.a = n)}
              value="lion"
              onChange={e => this.change(e.target.value)}
            />
            <input
              type="checkbox"
              ref={n => (this.b = n)}
              checked={true}
              onChange={() => {}}
            />
          </div>
        );
      }
    }

    application.start();
    const instance = cocoMvc.render(<ControlledInputs />, container);

    setUntrackedValue.call(instance.a, 'giraffe');
    // This must use the native event dispatching. If we simulate, we will
    // bypass the lazy event attachment system so we won't actually test this.
    dispatchEventOnNode(instance.a, 'input');

    expect(instance.a.value).toBe('lion');
    expect(instance.b.checked).toBe(true);
  });

  describe('switching text inputs between numeric and string numbers', () => {
    it('does change the number 2 to "2.0" with no change handler', () => {
      const stub = <input type="text" value={2} onChange={jest.fn()} />;
      const node = cocoMvc.render(stub, container);

      setUntrackedValue.call(node, '2.0');
      dispatchEventOnNode(node, 'input');

      expect(node.value).toBe('2');
      expect(node.getAttribute('value')).toBe('2');
    });

    it('does change the string "2" to "2.0" with no change handler', () => {
      const stub = <input type="text" value={'2'} onChange={jest.fn()} />;
      const node = cocoMvc.render(stub, container);

      setUntrackedValue.call(node, '2.0');
      dispatchEventOnNode(node, 'input');

      expect(node.value).toBe('2');
      expect(node.getAttribute('value')).toBe('2');
    });

    it('changes the number 2 to "2.0" using a change handler', () => {
      @view()
      class Stub {

        @reactive()
        value = 2

        onChange = event => {
          this.value = event.target.value;
        };
        render() {
          return <input type="text" value={this.value} onChange={this.onChange} />;
        }
      }

      application.start();
      const stub = cocoMvc.render(<Stub />, container);
      const node = cocoMvc.findDOMNode(stub);

      setUntrackedValue.call(node, '2.0');
      dispatchEventOnNode(node, 'input');

      expect(node.value).toBe('2.0');
      expect(node.getAttribute('value')).toBe('2.0');
    });
  })
})