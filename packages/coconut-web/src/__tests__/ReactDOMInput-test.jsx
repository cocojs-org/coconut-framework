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

function emptyFunction() {}

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

  it('does change the string ".98" to "0.98" with no change handler', () => {
    @view()
    class Stub {
      @reactive()
      value = '.98';

      render() {
        return <input type="number" value={this.value} />;
      }
    }

    application.start();
    let stub;
    stub = cocoMvc.render(<Stub />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.',
    );
    const node = cocoMvc.findDOMNode(stub);
    stub.value = '0.98';

    expect(node.value).toEqual('0.98');
  });

  it('performs a state change from "" to 0', () => {
    @view()
    class Stub {
      @reactive()
      value= '';
      render() {
        return <input type="number" value={this.value} readOnly={true} />;
      }
    }

    application.start();
    const stub = cocoMvc.render(<Stub />, container);
    const node = cocoMvc.findDOMNode(stub);
    stub.value = 0;

    expect(node.value).toEqual('0');
  });

  it('updates the value on radio buttons from "" to 0', function() {
    cocoMvc.render(
      <input type="radio" value="" onChange={function() {}} />,
      container,
    );
    cocoMvc.render(
      <input type="radio" value={0} onChange={function() {}} />,
      container,
    );
    expect(container.firstChild.value).toBe('0');
    expect(container.firstChild.getAttribute('value')).toBe('0');
  });

  it('updates the value on checkboxes from "" to 0', function() {
    cocoMvc.render(
      <input type="checkbox" value="" onChange={function() {}} />,
      container,
    );
    cocoMvc.render(
      <input type="checkbox" value={0} onChange={function() {}} />,
      container,
    );
    expect(container.firstChild.value).toBe('0');
    expect(container.firstChild.getAttribute('value')).toBe('0');
  });

  it('distinguishes precision for extra zeroes in string number values', () => {
    @view()
    class Stub {
      @reactive()
      value= '3.0000';
      render() {
        return <input type="number" value={this.value} />;
      }
    }

    application.start();
    let stub = cocoMvc.render(<Stub />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'You provided a `value` prop to a form field without an `onChange` handler. This will render a read-only field. If the field should be mutable use `defaultValue`. Otherwise, set either `onChange` or `readOnly`.',
    );
    const node = cocoMvc.findDOMNode(stub);
    stub.value = '3';

    expect(node.value).toEqual('3');
  });

  it('should display `defaultValue` of number 0', () => {
    const stub = <input type="text" defaultValue={0} />;
    const node = cocoMvc.render(stub, container);

    expect(node.getAttribute('value')).toBe('0');
    expect(node.value).toBe('0');
  });

  // todo 没有forceUpdate方法
  it('only assigns defaultValue if it changes', () => {
    @view()
    class Test {
      render() {
        return <input defaultValue="0" />;
      }
    }

    application.start();
    const component = cocoMvc.render(<Test />, container);
    const node = cocoMvc.findDOMNode(component);

    Object.defineProperty(node, 'defaultValue', {
      get() {
        return '0';
      },
      set(value) {
        throw new Error(
          `defaultValue was assigned ${value}, but it did not change!`,
        );
      },
    });

    // component.forceUpdate();
  });

  it('should display "true" for `defaultValue` of `true`', () => {
    const stub = <input type="text" defaultValue={true} />;
    const node = cocoMvc.render(stub, container);

    expect(node.value).toBe('true');
  });

  it('should display "false" for `defaultValue` of `false`', () => {
    const stub = <input type="text" defaultValue={false} />;
    const node = cocoMvc.render(stub, container);

    expect(node.value).toBe('false');
  });

  it('should update `defaultValue` for uncontrolled input', () => {
    const node = cocoMvc.render(
      <input type="text" defaultValue="0" />,
      container,
    );

    expect(node.value).toBe('0');
    expect(node.defaultValue).toBe('0');

    cocoMvc.render(<input type="text" defaultValue="1" />, container);

    expect(node.value).toBe('0');
    expect(node.defaultValue).toBe('1');
  });

  it('should update `defaultValue` for uncontrolled date/time input', () => {
    const node = cocoMvc.render(
      <input type="date" defaultValue="1980-01-01" />,
      container,
    );

    expect(node.value).toBe('1980-01-01');
    expect(node.defaultValue).toBe('1980-01-01');

    cocoMvc.render(<input type="date" defaultValue="2000-01-01" />, container);

    expect(node.value).toBe('1980-01-01');
    expect(node.defaultValue).toBe('2000-01-01');

    cocoMvc.render(<input type="date" />, container);
  });

  it('should take `defaultValue` when changing to uncontrolled input', () => {
    const node = cocoMvc.render(
      <input type="text" value="0" readOnly={true} />,
      container,
    );
    expect(node.value).toBe('0');
    cocoMvc.render(<input type="text" defaultValue="1" />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A component is changing a controlled input to be uncontrolled. ' +
      'This is likely caused by the value changing from a defined to ' +
      'undefined, which should not happen. ' +
      'Decide between using a controlled or uncontrolled input ' +
      'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
    );
    expect(node.value).toBe('0');
  });

  it('should render name attribute if it is supplied', () => {
    const node = cocoMvc.render(<input type="text" name="name" />, container);
    expect(node.name).toBe('name');
    expect(container.firstChild.getAttribute('name')).toBe('name');
  });

  it('should not render name attribute if it is not supplied', () => {
    cocoMvc.render(<input type="text" />, container);
    expect(container.firstChild.getAttribute('name')).toBe(null);
  });

  it('should display "foobar" for `defaultValue` of `objToString`', () => {
    const objToString = {
      toString: function() {
        return 'foobar';
      },
    };

    const stub = <input type="text" defaultValue={objToString} />;
    const node = cocoMvc.render(stub, container);

    expect(node.value).toBe('foobar');
  });

  it('should throw for date inputs if `defaultValue` is an object where valueOf() throws', () => {
    class TemporalLike {
      valueOf() {
        // Throwing here is the behavior of ECMAScript "Temporal" date/time API.
        // See https://tc39.es/proposal-temporal/docs/plaindate.html#valueOf
        throw new TypeError('prod message');
      }
      toString() {
        return '2020-01-01';
      }
    }
    const test = () =>
      cocoMvc.render(
        <input defaultValue={new TemporalLike()} type="date" />,
        container,
      );
    expect(test).toThrowError(new TypeError('prod message'));
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Form field values (value, checked, defaultValue, or defaultChecked props)' +
      ' must be strings, not %s.' +
      ' This value must be coerced to a string before before using it here.',
      'TemporalLike'
    );
  });

  it('should throw for text inputs if `defaultValue` is an object where valueOf() throws', () => {
    class TemporalLike {
      valueOf() {
        // Throwing here is the behavior of ECMAScript "Temporal" date/time API.
        // See https://tc39.es/proposal-temporal/docs/plaindate.html#valueOf
        throw new TypeError('prod message');
      }
      toString() {
        return '2020-01-01';
      }
    }
    const test = () =>
      cocoMvc.render(
        <input defaultValue={new TemporalLike()} type="text" />,
        container,
      );
    expect(test).toThrowError(new TypeError('prod message'));
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Form field values (value, checked, defaultValue, or defaultChecked props)' +
      ' must be strings, not %s.' +
      ' This value must be coerced to a string before before using it here.',
      'TemporalLike'
    );
  });

  it('should throw for date inputs if `value` is an object where valueOf() throws', () => {
    class TemporalLike {
      valueOf() {
        // Throwing here is the behavior of ECMAScript "Temporal" date/time API.
        // See https://tc39.es/proposal-temporal/docs/plaindate.html#valueOf
        throw new TypeError('prod message');
      }
      toString() {
        return '2020-01-01';
      }
    }
    const test = () =>
      cocoMvc.render(
        <input value={new TemporalLike()} type="date" onChange={() => {}} />,
        container,
      );
    expect(test).toThrowError(new TypeError('prod message'));
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Form field values (value, checked, defaultValue, or defaultChecked props)' +
      ' must be strings, not %s.' +
      ' This value must be coerced to a string before before using it here.',
      'TemporalLike'
    );
  });

  it('should throw for text inputs if `value` is an object where valueOf() throws', () => {
    class TemporalLike {
      valueOf() {
        // Throwing here is the behavior of ECMAScript "Temporal" date/time API.
        // See https://tc39.es/proposal-temporal/docs/plaindate.html#valueOf
        throw new TypeError('prod message');
      }
      toString() {
        return '2020-01-01';
      }
    }
    const test = () =>
      cocoMvc.render(
        <input value={new TemporalLike()} type="text" onChange={() => {}} />,
        container,
      );
    expect(test).toThrowError(new TypeError('prod message'));
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Form field values (value, checked, defaultValue, or defaultChecked props)' +
      ' must be strings, not %s.' +
      ' This value must be coerced to a string before before using it here.',
      'TemporalLike'
    );
  });

  it('should display `value` of number 0', () => {
    const stub = <input type="text" value={0} onChange={emptyFunction} />;
    const node = cocoMvc.render(stub, container);

    expect(node.value).toBe('0');
  });

  it('should allow setting `value` to `true`', () => {
    let stub = <input type="text" value="yolo" onChange={emptyFunction} />;
    const node = cocoMvc.render(stub, container);

    expect(node.value).toBe('yolo');

    stub = cocoMvc.render(
      <input type="text" value={true} onChange={emptyFunction} />,
      container,
    );
    expect(node.value).toEqual('true');
  });

  it('should allow setting `value` to `false`', () => {
    let stub = <input type="text" value="yolo" onChange={emptyFunction} />;
    const node = cocoMvc.render(stub, container);

    expect(node.value).toBe('yolo');

    stub = cocoMvc.render(
      <input type="text" value={false} onChange={emptyFunction} />,
      container,
    );
    expect(node.value).toEqual('false');
  });

  it('should allow setting `value` to `objToString`', () => {
    let stub = <input type="text" value="foo" onChange={emptyFunction} />;
    const node = cocoMvc.render(stub, container);

    expect(node.value).toBe('foo');

    const objToString = {
      toString: function() {
        return 'foobar';
      },
    };
    stub = cocoMvc.render(
      <input type="text" value={objToString} onChange={emptyFunction} />,
      container,
    );
    expect(node.value).toEqual('foobar');
  });

  it('should not incur unnecessary DOM mutations', () => {
    cocoMvc.render(<input value="a" onChange={() => {}} />, container);

    const node = container.firstChild;
    let nodeValue = 'a';
    const nodeValueSetter = jest.fn();
    Object.defineProperty(node, 'value', {
      get: function() {
        return nodeValue;
      },
      set: nodeValueSetter.mockImplementation(function(newValue) {
        nodeValue = newValue;
      }),
    });

    cocoMvc.render(<input value="a" onChange={() => {}} />, container);
    expect(nodeValueSetter).toHaveBeenCalledTimes(0);

    cocoMvc.render(<input value="b" onChange={() => {}} />, container);
    expect(nodeValueSetter).toHaveBeenCalledTimes(1);
  });

  it('should not incur unnecessary DOM mutations for numeric type conversion', () => {
    cocoMvc.render(<input value="0" onChange={() => {}} />, container);

    const node = container.firstChild;
    let nodeValue = '0';
    const nodeValueSetter = jest.fn();
    Object.defineProperty(node, 'value', {
      get: function() {
        return nodeValue;
      },
      set: nodeValueSetter.mockImplementation(function(newValue) {
        nodeValue = newValue;
      }),
    });

    cocoMvc.render(<input value={0} onChange={() => {}} />, container);
    expect(nodeValueSetter).toHaveBeenCalledTimes(0);
  });

  it('should not incur unnecessary DOM mutations for the boolean type conversion', () => {
    cocoMvc.render(<input value="true" onChange={() => {}} />, container);

    const node = container.firstChild;
    let nodeValue = 'true';
    const nodeValueSetter = jest.fn();
    Object.defineProperty(node, 'value', {
      get: function() {
        return nodeValue;
      },
      set: nodeValueSetter.mockImplementation(function(newValue) {
        nodeValue = newValue;
      }),
    });

    cocoMvc.render(<input value={true} onChange={() => {}} />, container);
    expect(nodeValueSetter).toHaveBeenCalledTimes(0);
  });

  it('should properly control a value of number `0`', () => {
    const stub = <input type="text" value={0} onChange={emptyFunction} />;
    const node = cocoMvc.render(stub, container);

    setUntrackedValue.call(node, 'giraffe');
    dispatchEventOnNode(node, 'input');
    expect(node.value).toBe('0');
  });

  it('should properly control 0.0 for a text input', () => {
    const stub = <input type="text" value={0} onChange={emptyFunction} />;
    const node = cocoMvc.render(stub, container);

    setUntrackedValue.call(node, '0.0');
    dispatchEventOnNode(node, 'input');
    expect(node.value).toBe('0');
  });

  it('should properly control 0.0 for a number input', () => {
    const stub = <input type="number" value={0} onChange={emptyFunction} />;
    const node = cocoMvc.render(stub, container);

    setUntrackedValue.call(node, '0.0');
    dispatchEventOnNode(node, 'input');

    dispatchEventOnNode(node, 'blur');
    dispatchEventOnNode(node, 'focusout');

    expect(node.value).toBe('0.0');
    expect(node.getAttribute('value')).toBe('0.0');
  });
})