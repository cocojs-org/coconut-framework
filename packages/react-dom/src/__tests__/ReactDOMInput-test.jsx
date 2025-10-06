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
  let cocoMvc;
  let Application;
  let application;
  let jsx;
  let view;
  let reactive;
  let ref;
  let container;
  let consoleErrorSpy;
  let setUntrackedValue;
  let setUntrackedChecked;
  let getMetaClassById;

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
    Application = cocoMvc.Application;
    view = cocoMvc.view;
    reactive = cocoMvc.reactive;
    ref = cocoMvc.ref;
    jsx = cocoMvc.jsx;
    getMetaClassById = cocoMvc.getMetaClassById;
    application = new Application();
    cocoMvc.registerApplication(application, getMetaClassById);

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

    // todo 没有forceUpdate方法
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

  it('should properly transition from an empty value to 0', function() {
    cocoMvc.render(
      <input type="text" value="" onChange={emptyFunction} />,
      container,
    );
    cocoMvc.render(
      <input type="text" value={0} onChange={emptyFunction} />,
      container,
    );

    const node = container.firstChild;
    expect(node.value).toBe('0');

    expect(node.defaultValue).toBe('0');
  });

  it('should properly transition from 0 to an empty value', function() {
    cocoMvc.render(
      <input type="text" value={0} onChange={emptyFunction} />,
      container,
    );
    cocoMvc.render(
      <input type="text" value="" onChange={emptyFunction} />,
      container,
    );

    const node = container.firstChild;

    expect(node.value).toBe('');
    expect(node.defaultValue).toBe('');
  });

  it('should properly transition a text input from 0 to an empty 0.0', function() {
    cocoMvc.render(
      <input type="text" value={0} onChange={emptyFunction} />,
      container,
    );
    cocoMvc.render(
      <input type="text" value="0.0" onChange={emptyFunction} />,
      container,
    );

    const node = container.firstChild;

    expect(node.value).toBe('0.0');
    expect(node.defaultValue).toBe('0.0');
  });

  it('should properly transition a number input from "" to 0', function() {
    cocoMvc.render(
      <input type="number" value="" onChange={emptyFunction} />,
      container,
    );
    cocoMvc.render(
      <input type="number" value={0} onChange={emptyFunction} />,
      container,
    );

    const node = container.firstChild;

    expect(node.value).toBe('0');
    expect(node.defaultValue).toBe('0');
  });

  it('should properly transition a number input from "" to "0"', function() {
    cocoMvc.render(
      <input type="number" value="" onChange={emptyFunction} />,
      container,
    );
    cocoMvc.render(
      <input type="number" value="0" onChange={emptyFunction} />,
      container,
    );

    const node = container.firstChild;

    expect(node.value).toBe('0');
    expect(node.defaultValue).toBe('0');
  });

  it('should have the correct target value', () => {
    let handled = false;
    const handler = function(event) {
      expect(event.target.nodeName).toBe('INPUT');
      handled = true;
    };
    const stub = <input type="text" value={0} onChange={handler} />;
    const node = cocoMvc.render(stub, container);

    setUntrackedValue.call(node, 'giraffe');

    dispatchEventOnNode(node, 'input');

    expect(handled).toBe(true);
  });

  it('should restore uncontrolled inputs to last defaultValue upon reset', () => {
    const inputRef = {current: null};
    cocoMvc.render(
      <form>
        <input defaultValue="default1" ref={inputRef} />
        <input type="reset" />
      </form>,
      container,
    );
    expect(inputRef.current.value).toBe('default1');

    setUntrackedValue.call(inputRef.current, 'changed');
    dispatchEventOnNode(inputRef.current, 'input');
    expect(inputRef.current.value).toBe('changed');

    cocoMvc.render(
      <form>
        <input defaultValue="default2" ref={inputRef} />
        <input type="reset" />
      </form>,
      container,
    );
    expect(inputRef.current.value).toBe('changed');

    container.firstChild.reset();
    // Note: I don't know if we want to always support this.
    // But it's current behavior so worth being intentional if we break it.
    // https://github.com/facebook/react/issues/4618
    expect(inputRef.current.value).toBe('default2');
  });

  it('should not set a value for submit buttons unnecessarily', () => {
    const stub = <input type="submit" />;
    cocoMvc.render(stub, container);
    const node = container.firstChild;

    // The value shouldn't be '', or else the button will have no text; it
    // should have the default "Submit" or "Submit Query" label. Most browsers
    // report this as not having a `value` attribute at all; IE reports it as
    // the actual label that the user sees.
    expect(node.hasAttribute('value')).toBe(false);
  });

  it('should remove the value attribute on submit inputs when value is updated to undefined', () => {
    const stub = <input type="submit" value="foo" onChange={emptyFunction} />;
    cocoMvc.render(stub, container);

    // Not really relevant to this particular test, but changing to undefined
    // should nonetheless trigger a warning
    cocoMvc.render(
      <input type="submit" value={undefined} onChange={emptyFunction} />,
      container,
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A component is changing a controlled input to be uncontrolled. ' +
      'This is likely caused by the value changing from a defined to ' +
      'undefined, which should not happen. ' +
      'Decide between using a controlled or uncontrolled input ' +
      'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
    );

    const node = container.firstChild;
    expect(node.getAttribute('value')).toBe(null);
  });

  it('should remove the value attribute on reset inputs when value is updated to undefined', () => {
    const stub = <input type="reset" value="foo" onChange={emptyFunction} />;
    cocoMvc.render(stub, container);

    // Not really relevant to this particular test, but changing to undefined
    // should nonetheless trigger a warning
    cocoMvc.render(
      <input type="reset" value={undefined} onChange={emptyFunction} />,
      container,
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A component is changing a controlled input to be uncontrolled. ' +
      'This is likely caused by the value changing from a defined to ' +
      'undefined, which should not happen. ' +
      'Decide between using a controlled or uncontrolled input ' +
      'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
    );

    const node = container.firstChild;
    expect(node.getAttribute('value')).toBe(null);
  });

  it('should set a value on a submit input', () => {
    const stub = <input type="submit" value="banana" />;
    cocoMvc.render(stub, container);
    const node = container.firstChild;

    expect(node.getAttribute('value')).toBe('banana');
  });

  it('should not set an undefined value on a submit input', () => {
    const stub = <input type="submit" value={undefined} />;
    cocoMvc.render(stub, container);
    const node = container.firstChild;

    // Note: it shouldn't be an empty string
    // because that would erase the "submit" label.
    expect(node.getAttribute('value')).toBe(null);

    cocoMvc.render(stub, container);
    expect(node.getAttribute('value')).toBe(null);
  });

  it('should not set an undefined value on a reset input', () => {
    const stub = <input type="reset" value={undefined} />;
    cocoMvc.render(stub, container);
    const node = container.firstChild;

    // Note: it shouldn't be an empty string
    // because that would erase the "reset" label.
    expect(node.getAttribute('value')).toBe(null);

    cocoMvc.render(stub, container);
    expect(node.getAttribute('value')).toBe(null);
  });

  it('should not set a null value on a submit input', () => {
    const stub = <input type="submit" value={null} />;
    cocoMvc.render(stub, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '`value` prop on `%s` should not be null. ' +
      'Consider using an empty string to clear the component or `undefined` ' +
      'for uncontrolled components.',
      'input',
    );
    const node = container.firstChild;

    // Note: it shouldn't be an empty string
    // because that would erase the "submit" label.
    expect(node.getAttribute('value')).toBe(null);

    cocoMvc.render(stub, container);
    expect(node.getAttribute('value')).toBe(null);
  });

  it('should not set a null value on a reset input', () => {
    const stub = <input type="reset" value={null} />;
    cocoMvc.render(stub, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '`value` prop on `%s` should not be null. ' +
      'Consider using an empty string to clear the component or `undefined` ' +
      'for uncontrolled components.',
      'input',
    );
    const node = container.firstChild;

    // Note: it shouldn't be an empty string
    // because that would erase the "reset" label.
    expect(node.getAttribute('value')).toBe(null);

    cocoMvc.render(stub, container);
    expect(node.getAttribute('value')).toBe(null);
  });

  it('should set a value on a reset input', () => {
    const stub = <input type="reset" value="banana" />;
    cocoMvc.render(stub, container);
    const node = container.firstChild;

    expect(node.getAttribute('value')).toBe('banana');
  });

  it('should set an empty string value on a submit input', () => {
    const stub = <input type="submit" value="" />;
    cocoMvc.render(stub, container);
    const node = container.firstChild;

    expect(node.getAttribute('value')).toBe('');
  });

  it('should set an empty string value on a reset input', () => {
    const stub = <input type="reset" value="" />;
    cocoMvc.render(stub, container);
    const node = container.firstChild;

    expect(node.getAttribute('value')).toBe('');
  });

  it('should control radio buttons', () => {
    @view()
    class RadioGroup {
      @ref()
      aRef
      @ref()
      bRef
      @ref()
      cRef
      render() {
        return (
          <div>
            <input
              ref={this.aRef}
              type="radio"
              name="fruit"
              checked={true}
              onChange={emptyFunction}
            />
            A
            <input ref={this.bRef} type="radio" name="fruit" onChange={emptyFunction} />
            B
            <form>
              <input
                ref={this.cRef}
                type="radio"
                name="fruit"
                defaultChecked={true}
                onChange={emptyFunction}
              />
            </form>
          </div>
        );
      }
    }

    application.start();
    const stub = cocoMvc.render(<RadioGroup />, container);
    const aNode = stub.aRef.current;
    const bNode = stub.bRef.current;
    const cNode = stub.cRef.current;

    expect(aNode.checked).toBe(true);
    expect(bNode.checked).toBe(false);
    // c is in a separate form and shouldn't be affected at all here
    expect(cNode.checked).toBe(true);

    expect(aNode.hasAttribute('checked')).toBe(true);
    expect(bNode.hasAttribute('checked')).toBe(false);
    expect(cNode.hasAttribute('checked')).toBe(true);

    setUntrackedChecked.call(bNode, true);
    expect(aNode.checked).toBe(false);
    expect(cNode.checked).toBe(true);

    // The original 'checked' attribute should be unchanged
    expect(aNode.hasAttribute('checked')).toBe(true);
    expect(bNode.hasAttribute('checked')).toBe(false);
    expect(cNode.hasAttribute('checked')).toBe(true);

    // Now let's run the actual ReactDOMInput change event handler
    dispatchEventOnNode(bNode, 'click');

    // The original state should have been restored
    expect(aNode.checked).toBe(true);
    expect(cNode.checked).toBe(true);
  });

  it('should check the correct radio when the selected name moves', () => {
    @view()
    class App {
      @reactive()
      updated = false;
      onClick = () => {
        this.updated = true;
      };
      render() {
        const radioName = this.updated ? 'secondName' : 'firstName';
        return (
          <div>
            <button type="button" onClick={this.onClick} />
            <input
              type="radio"
              name={radioName}
              onChange={emptyFunction}
              checked={this.updated === true}
            />
            <input
              type="radio"
              name={radioName}
              onChange={emptyFunction}
              checked={this.updated === false}
            />
          </div>
        );
      }
    }

    application.start();
    const stub = cocoMvc.render(<App />, container);
    const buttonNode = cocoMvc.findDOMNode(stub).childNodes[0];
    const firstRadioNode = cocoMvc.findDOMNode(stub).childNodes[1];
    expect(firstRadioNode.checked).toBe(false);
    dispatchEventOnNode(buttonNode, 'click');
    expect(firstRadioNode.checked).toBe(true);
  });

  it('should control radio buttons if the tree updates during render', () => {
    const sharedParent = container;
    const container1 = document.createElement('div');
    const container2 = document.createElement('div');

    sharedParent.appendChild(container1);

    let aNode;
    let bNode;
    @view()
    class ComponentA {
      @reactive()
      changed = false;
      handleChange = () => {
        this.changed = true;
      };
      viewDidUpdate() {
        sharedParent.appendChild(container2);
      }
      viewDidMount() {
        cocoMvc.render(<ComponentB />, container2);
      }
      render() {
        return (
          <div>
            <input
              ref={n => (aNode = n)}
              type="radio"
              name="fruit"
              checked={false}
              onChange={this.handleChange}
            />
            A
          </div>
        );
      }
    }

    @view()
    class ComponentB {
      render() {
        return (
          <div>
            <input
              ref={n => (bNode = n)}
              type="radio"
              name="fruit"
              checked={true}
              onChange={emptyFunction}
            />
            B
          </div>
        );
      }
    }

    application.start();
    cocoMvc.render(<ComponentA />, container1);

    expect(aNode.checked).toBe(false);
    expect(bNode.checked).toBe(true);

    setUntrackedChecked.call(aNode, true);
    // This next line isn't necessary in a proper browser environment, but
    // jsdom doesn't uncheck the others in a group (because they are not yet
    // sharing a parent), which makes this whole test a little less effective.
    setUntrackedChecked.call(bNode, false);

    // Now let's run the actual ReactDOMInput change event handler
    dispatchEventOnNode(aNode, 'click');

    // The original state should have been restored
    expect(aNode.checked).toBe(false);
    expect(bNode.checked).toBe(true);
  });

  it('should warn with value and no onChange handler and readOnly specified', () => {
    cocoMvc.render(
      <input type="text" value="zoink" readOnly={true} />,
      container,
    );
    cocoMvc.unmountComponentAtNode(container);

    cocoMvc.render(
      <input type="text" value="zoink" readOnly={false} />,
      container,
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'You provided a `value` prop to a form field without an ' +
      '`onChange` handler. This will render a read-only field. If ' +
      'the field should be mutable use `defaultValue`. Otherwise, ' +
      'set either `onChange` or `readOnly`.',
    );
  });

  it('should have a this value of undefined if bind is not used', () => {
    expect.assertions(1);
    const unboundInputOnChange = function() {
      expect(this).toBe(undefined);
    };

    const stub = <input type="text" onChange={unboundInputOnChange} />;
    const node = cocoMvc.render(stub, container);

    setUntrackedValue.call(node, 'giraffe');
    dispatchEventOnNode(node, 'input');
  });

  it('should update defaultValue to empty string', () => {
    cocoMvc.render(<input type="text" defaultValue={'foo'} />, container);
    cocoMvc.render(<input type="text" defaultValue={''} />, container);
    expect(container.firstChild.defaultValue).toBe('');
  });

  it('should warn if value is null', () => {
    cocoMvc.render(<input type="text" value={null} />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '`value` prop on `%s` should not be null. ' +
      'Consider using an empty string to clear the component or `undefined` ' +
      'for uncontrolled components.',
      'input',
    );
    cocoMvc.unmountComponentAtNode(container);

    cocoMvc.render(<input type="text" value={null} />, container);
  });

  it('should warn if checked and defaultChecked props are specified', () => {
    cocoMvc.render(
      <input
        type="radio"
        checked={true}
        defaultChecked={true}
        readOnly={true}
      />,
      container,
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '%s contains an input of type %s with both checked and defaultChecked props. ' +
      'Input elements must be either controlled or uncontrolled ' +
      '(specify either the checked prop, or the defaultChecked prop, but not ' +
      'both). Decide between using a controlled or uncontrolled input ' +
      'element and remove one of these props. More info: ' +
      'https://reactjs.org/link/controlled-components',
      'A component',
      'radio',
    )
    cocoMvc.unmountComponentAtNode(container);

    cocoMvc.render(
      <input
        type="radio"
        checked={true}
        defaultChecked={true}
        readOnly={true}
      />,
      container,
    );
  });

  it('should warn if value and defaultValue props are specified', () => {
    cocoMvc.render(
      <input type="text" value="foo" defaultValue="bar" readOnly={true} />,
      container,
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '%s contains an input of type %s with both value and defaultValue props. ' +
      'Input elements must be either controlled or uncontrolled ' +
      '(specify either the value prop, or the defaultValue prop, but not ' +
      'both). Decide between using a controlled or uncontrolled input ' +
      'element and remove one of these props. More info: ' +
      'https://reactjs.org/link/controlled-components',
      'A component',
      'text',
    );
    cocoMvc.unmountComponentAtNode(container);

    cocoMvc.render(
      <input type="text" value="foo" defaultValue="bar" readOnly={true} />,
      container,
    );
  });

  it('should warn if controlled input switches to uncontrolled (value is undefined)', () => {
    const stub = (
      <input type="text" value="controlled" onChange={emptyFunction} />
    );
    cocoMvc.render(stub, container);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    cocoMvc.render(<input type="text" />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A component is changing a controlled input to be uncontrolled. ' +
      'This is likely caused by the value changing from a defined to ' +
      'undefined, which should not happen. ' +
      'Decide between using a controlled or uncontrolled input ' +
      'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
    );
  });

  it('should warn if controlled input switches to uncontrolled (value is null)', () => {
    const stub = (
      <input type="text" value="controlled" onChange={emptyFunction} />
    );
    cocoMvc.render(stub, container);
    expect(consoleErrorSpy).not.toHaveBeenCalled();
    cocoMvc.render(<input type="text" value={null} />, container);
    expect(consoleErrorSpy.mock.calls[0]).toEqual(
      [
        '`value` prop on `%s` should not be null. ' +
        'Consider using an empty string to clear the component or `undefined` ' +
        'for uncontrolled components.',
        'input',
      ]
    );
    expect(consoleErrorSpy.mock.calls[1]).toEqual([
      'A component is changing a controlled input to be uncontrolled. ' +
      'This is likely caused by the value changing from a defined to ' +
      'undefined, which should not happen. ' +
      'Decide between using a controlled or uncontrolled input ' +
      'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
    ])
  });

  it('should warn if controlled input switches to uncontrolled with defaultValue', () => {
    const stub = (
      <input type="text" value="controlled" onChange={emptyFunction} />
    );
    cocoMvc.render(stub, container);
    cocoMvc.render(
      <input type="text" defaultValue="uncontrolled" />,
      container,
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A component is changing a controlled input to be uncontrolled. ' +
      'This is likely caused by the value changing from a defined to ' +
      'undefined, which should not happen. ' +
      'Decide between using a controlled or uncontrolled input ' +
      'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
    );
  });

  it('should warn if uncontrolled input (value is undefined) switches to controlled', () => {
    const stub = <input type="text" />;
    cocoMvc.render(stub, container);
    cocoMvc.render(<input type="text" value="controlled" />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A component is changing an uncontrolled input to be controlled. ' +
      'This is likely caused by the value changing from undefined to ' +
      'a defined value, which should not happen. ' +
      'Decide between using a controlled or uncontrolled input ' +
      'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
    )
  });

  it('should warn if uncontrolled input (value is null) switches to controlled', () => {
    const stub = <input type="text" value={null} />;
    cocoMvc.render(stub, container);
    expect(consoleErrorSpy.mock.calls[0]).toEqual(
      [
        '`value` prop on `%s` should not be null. ' +
        'Consider using an empty string to clear the component or `undefined` ' +
        'for uncontrolled components.',
        'input',
      ]
    );
    cocoMvc.render(<input type="text" value="controlled" />, container);
    expect(consoleErrorSpy.mock.calls[1]).toEqual(
      [
        'A component is changing an uncontrolled input to be controlled. ' +
        'This is likely caused by the value changing from undefined to ' +
        'a defined value, which should not happen. ' +
        'Decide between using a controlled or uncontrolled input ' +
        'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
      ]
    )
  });

  it('should warn if controlled checkbox switches to uncontrolled (checked is undefined)', () => {
    const stub = (
      <input type="checkbox" checked={true} onChange={emptyFunction} />
    );
    cocoMvc.render(stub, container);
    cocoMvc.render(<input type="checkbox" />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A component is changing a controlled input to be uncontrolled. ' +
      'This is likely caused by the value changing from a defined to ' +
      'undefined, which should not happen. ' +
      'Decide between using a controlled or uncontrolled input ' +
      'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
    );
  });

  it('should warn if controlled checkbox switches to uncontrolled (checked is null)', () => {
    const stub = (
      <input type="checkbox" checked={true} onChange={emptyFunction} />
    );
    cocoMvc.render(stub, container);
    cocoMvc.render(<input type="checkbox" checked={null} />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A component is changing a controlled input to be uncontrolled. ' +
      'This is likely caused by the value changing from a defined to ' +
      'undefined, which should not happen. ' +
      'Decide between using a controlled or uncontrolled input ' +
      'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
    );
  });

  it('should warn if controlled checkbox switches to uncontrolled with defaultChecked', () => {
    const stub = (
      <input type="checkbox" checked={true} onChange={emptyFunction} />
    );
    cocoMvc.render(stub, container);
    cocoMvc.render(
      <input type="checkbox" defaultChecked={true} />,
      container,
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A component is changing a controlled input to be uncontrolled. ' +
      'This is likely caused by the value changing from a defined to ' +
      'undefined, which should not happen. ' +
      'Decide between using a controlled or uncontrolled input ' +
      'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
    );
  });

  it('should warn if uncontrolled checkbox (checked is undefined) switches to controlled', () => {
    const stub = <input type="checkbox" />;
    cocoMvc.render(stub, container);
    cocoMvc.render(<input type="checkbox" checked={true} />, container);
    expect(consoleErrorSpy.mock.calls[0]).toEqual(
      [
        'A component is changing an uncontrolled input to be controlled. ' +
        'This is likely caused by the value changing from undefined to ' +
        'a defined value, which should not happen. ' +
        'Decide between using a controlled or uncontrolled input ' +
        'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
      ]
    )
  });

  it('should warn if uncontrolled checkbox (checked is null) switches to controlled', () => {
    const stub = <input type="checkbox" checked={null} />;
    cocoMvc.render(stub, container);
    cocoMvc.render(<input type="checkbox" checked={true} />, container);
    expect(consoleErrorSpy.mock.calls[0]).toEqual(
      [
        'A component is changing an uncontrolled input to be controlled. ' +
        'This is likely caused by the value changing from undefined to ' +
        'a defined value, which should not happen. ' +
        'Decide between using a controlled or uncontrolled input ' +
        'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
      ]
    )
  });

  it('should warn if controlled radio switches to uncontrolled (checked is undefined)', () => {
    const stub = <input type="radio" checked={true} onChange={emptyFunction} />;
    cocoMvc.render(stub, container);
    cocoMvc.render(<input type="radio" />, container);
    expect(consoleErrorSpy.mock.calls[0]).toEqual(
      [
        'A component is changing a controlled input to be uncontrolled. ' +
        'This is likely caused by the value changing from a defined to ' +
        'undefined, which should not happen. ' +
        'Decide between using a controlled or uncontrolled input ' +
        'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
      ]
    )
  });

  it('should warn if controlled radio switches to uncontrolled (checked is null)', () => {
    const stub = <input type="radio" checked={true} onChange={emptyFunction} />;
    cocoMvc.render(stub, container);
    cocoMvc.render(<input type="radio" checked={null} />, container);
    expect(consoleErrorSpy.mock.calls[0]).toEqual(
      [
        'A component is changing a controlled input to be uncontrolled. ' +
        'This is likely caused by the value changing from a defined to ' +
        'undefined, which should not happen. ' +
        'Decide between using a controlled or uncontrolled input ' +
        'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
      ]
    )
  });

  it('should warn if controlled radio switches to uncontrolled with defaultChecked', () => {
    const stub = <input type="radio" checked={true} onChange={emptyFunction} />;
    cocoMvc.render(stub, container);
    cocoMvc.render(<input type="radio" defaultChecked={true} />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A component is changing a controlled input to be uncontrolled. ' +
      'This is likely caused by the value changing from a defined to ' +
      'undefined, which should not happen. ' +
      'Decide between using a controlled or uncontrolled input ' +
      'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
    )
  });

  it('should warn if uncontrolled radio (checked is undefined) switches to controlled', () => {
    const stub = <input type="radio" />;
    cocoMvc.render(stub, container);
    cocoMvc.render(<input type="radio" checked={true} />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A component is changing an uncontrolled input to be controlled. ' +
      'This is likely caused by the value changing from undefined to ' +
      'a defined value, which should not happen. ' +
      'Decide between using a controlled or uncontrolled input ' +
      'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
    );
  });

  it('should warn if uncontrolled radio (checked is null) switches to controlled', () => {
    const stub = <input type="radio" checked={null} />;
    cocoMvc.render(stub, container);
    cocoMvc.render(<input type="radio" checked={true} />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A component is changing an uncontrolled input to be controlled. ' +
      'This is likely caused by the value changing from undefined to ' +
      'a defined value, which should not happen. ' +
      'Decide between using a controlled or uncontrolled input ' +
      'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
    );
  });

  it('should not warn if radio value changes but never becomes controlled', () => {
    cocoMvc.render(<input type="radio" value="value" />, container);
    cocoMvc.render(<input type="radio" />, container);
    cocoMvc.render(
      <input type="radio" value="value" defaultChecked={true} />,
      container,
    );
    cocoMvc.render(
      <input type="radio" value="value" onChange={() => null} />,
      container,
    );
    cocoMvc.render(<input type="radio" />, container);
  });

  it('should not warn if radio value changes but never becomes uncontrolled', () => {
    cocoMvc.render(
      <input type="radio" checked={false} onChange={() => null} />,
      container,
    );
    cocoMvc.render(
      <input
        type="radio"
        value="value"
        defaultChecked={true}
        checked={false}
        onChange={() => null}
      />,
      container,
    );
  });

  it('should warn if radio checked false changes to become uncontrolled', () => {
    cocoMvc.render(
      <input
        type="radio"
        value="value"
        checked={false}
        onChange={() => null}
      />,
      container,
    );
    cocoMvc.render(<input type="radio" value="value" />, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'A component is changing a controlled input to be uncontrolled. ' +
      'This is likely caused by the value changing from a defined to ' +
      'undefined, which should not happen. ' +
      'Decide between using a controlled or uncontrolled input ' +
      'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
    )
  });

  it('sets type, step, min, max before value always', () => {
    const log = [];
    const originalCreateElement = document.createElement;
    jest.spyOn(document, 'createElement').mockImplementation(function(type) {
      const el = originalCreateElement.apply(this, arguments);
      let value = '';

      if (type === 'input') {
        Object.defineProperty(el, 'value', {
          get: function() {
            return value;
          },
          set: function(val) {
            value = String(val);
            log.push('set property value');
          },
        });
        jest.spyOn(el, 'setAttribute').mockImplementation(function(name) {
          log.push('set attribute ' + name);
        });
      }
      return el;
    });

    cocoMvc.render(
      <input
        value="0"
        onChange={() => {}}
        type="range"
        min="0"
        max="100"
        step="1"
      />,
      container,
    );

    expect(log).toEqual([
      'set attribute type',
      'set attribute min',
      'set attribute max',
      'set attribute step',
      'set property value',
    ]);
    document.createElement = originalCreateElement;
  });

  it('sets value properly with type coming later in props', () => {
    const input = cocoMvc.render(<input value="hi" type="radio" />, container);
    expect(input.value).toBe('hi');
  });

  it('does not raise a validation warning when it switches types', () => {
    @view()
    class Input {
      @reactive()
      state = {type: 'number', value: 1000};

      render() {
        const {value, type} = this.state;
        return <input onChange={() => {}} type={type} value={value} />;
      }
    }

    application.start();
    const input = cocoMvc.render(<Input />, container);
    const node = cocoMvc.findDOMNode(input);

    // If the value is set before the type, a validation warning will raise and
    // the value will not be assigned.
    input.state = {type: 'text', value: 'Test'};
    expect(node.value).toEqual('Test');
  });

  it('resets value of date/time input to fix bugs in iOS Safari', () => {
    function strify(x) {
      return JSON.stringify(x, null, 2);
    }

    const log = [];
    const originalCreateElement = document.createElement;
    jest.spyOn(document, 'createElement').mockImplementation(function(type) {
      const el = originalCreateElement.apply(this, arguments);
      const getDefaultValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'defaultValue',
      ).get;
      const setDefaultValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'defaultValue',
      ).set;
      const getValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).get;
      const setValue = Object.getOwnPropertyDescriptor(
        HTMLInputElement.prototype,
        'value',
      ).set;
      if (type === 'input') {
        Object.defineProperty(el, 'defaultValue', {
          get: function() {
            return getDefaultValue.call(this);
          },
          set: function(val) {
            log.push(`node.defaultValue = ${strify(val)}`);
            setDefaultValue.call(this, val);
          },
        });
        Object.defineProperty(el, 'value', {
          get: function() {
            return getValue.call(this);
          },
          set: function(val) {
            log.push(`node.value = ${strify(val)}`);
            setValue.call(this, val);
          },
        });
        jest.spyOn(el, 'setAttribute').mockImplementation(function(name, val) {
          log.push(`node.setAttribute(${strify(name)}, ${strify(val)})`);
        });
      }
      return el;
    });

    cocoMvc.render(<input type="date" defaultValue="1980-01-01" />, container);

    expect(log).toEqual([
      'node.setAttribute("type", "date")',
      // value must be assigned before defaultValue. This fixes an issue where the
      // visually displayed value of date inputs disappears on mobile Safari and Chrome:
      // https://github.com/facebook/react/issues/7233
      'node.value = "1980-01-01"',
      'node.defaultValue = "1980-01-01"',
    ]);
    document.createElement = originalCreateElement;
  });

  describe('assigning the value attribute on controlled inputs', function() {
    function getTestInput() {
      @view()
      class App {
        // todo 在构造函数中进行prop赋值的一个问题是框架会使用new进行field装饰器的初始化，这时候是没有入参的。也就是说使用props初始化field和收集field装饰器是矛盾的
        constructor(props) {
          this.props = props;
          this.value = this.props?.value == null ? '' : this.props?.value;
        }

        @reactive()
        value;

        onChange = event => {
          this.value = event.target.value;
        };
        render() {
          const type = this.props.type;
          const value = this.value;

          return <input type={type} value={value} onChange={this.onChange} />;
        }
      }
      return App;
    }

    it('always sets the attribute when values change on text inputs', function() {
      const Input = getTestInput();
      application.start();
      const stub = cocoMvc.render(<Input type="text" />, container);
      const node = cocoMvc.findDOMNode(stub);

      setUntrackedValue.call(node, '2');
      dispatchEventOnNode(node, 'input');

      expect(node.getAttribute('value')).toBe('2');
    });

    it('does not set the value attribute on number inputs if focused', () => {
      const Input = getTestInput();
      application.start();
      const stub = cocoMvc.render(
        <Input type="number" value="1" />,
        container,
      );
      const node = cocoMvc.findDOMNode(stub);

      node.focus()

      setUntrackedValue.call(node, '2');
      dispatchEventOnNode(node, 'input');

      expect(node.getAttribute('value')).toBe('1');
    });

    it('sets the value attribute on number inputs on blur', () => {
      const Input = getTestInput();
      application.start();
      const stub = cocoMvc.render(
        <Input type="number" value="1" />,
        container,
      );
      const node = cocoMvc.findDOMNode(stub);

      node.focus();
      setUntrackedValue.call(node, '2');
      dispatchEventOnNode(node, 'input');
      // TODO: it is unclear why blur must be triggered twice,
      // manual testing in the fixtures shows that the active element
      // is no longer the input, however blur() + a blur event seem to
      // be the only way to remove focus in JSDOM
      node.blur();
      dispatchEventOnNode(node, 'blur');
      dispatchEventOnNode(node, 'focusout');

      expect(node.value).toBe('2');
      expect(node.getAttribute('value')).toBe('2');
    });

    it('an uncontrolled number input will not update the value attribute on blur', () => {
      const node = cocoMvc.render(
        <input type="number" defaultValue="1" />,
        container,
      );

      node.focus();
      setUntrackedValue.call(node, 4);
      dispatchEventOnNode(node, 'input');
      // TODO: it is unclear why blur must be triggered twice,
      // manual testing in the fixtures shows that the active element
      // is no longer the input, however blur() + a blur event seem to
      // be the only way to remove focus in JSDOM
      node.blur();
      dispatchEventOnNode(node, 'blur');
      dispatchEventOnNode(node, 'focusout');

      expect(node.getAttribute('value')).toBe('1');
    });

    it('an uncontrolled text input will not update the value attribute on blur', () => {
      const node = cocoMvc.render(
        <input type="text" defaultValue="1" />,
        container,
      );

      node.focus();
      setUntrackedValue.call(node, 4);
      dispatchEventOnNode(node, 'input');
      // TODO: it is unclear why blur must be triggered twice,
      // manual testing in the fixtures shows that the active element
      // is no longer the input, however blur() + a blur event seem to
      // be the only way to remove focus in JSDOM
      node.blur();
      dispatchEventOnNode(node, 'blur');
      dispatchEventOnNode(node, 'focusout');

      expect(node.getAttribute('value')).toBe('1');
    });
  })

  describe('setting a controlled input to undefined', () => {
    let input;

    function renderInputWithStringThenWithUndefined() {
      let setValueToUndefined;

      @view()
      class Input {
        constructor() {
          setValueToUndefined = () => {
            this.value = undefined;
          }
        }

        @reactive()
        value = 'first';

        render() {
          return (
            <input
              onChange={e => this.value = e.target.value}
              value={this.value}
            />
          );
        }
      }

      application.start();
      const stub = cocoMvc.render(<Input />, container);
      input = cocoMvc.findDOMNode(stub);
      setUntrackedValue.call(input, 'latest');
      dispatchEventOnNode(input, 'input');
      setValueToUndefined();
    }

    it('reverts the value attribute to the initial value', () => {
      renderInputWithStringThenWithUndefined()
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'A component is changing a controlled input to be uncontrolled. ' +
        'This is likely caused by the value changing from a defined to ' +
        'undefined, which should not happen. ' +
        'Decide between using a controlled or uncontrolled input ' +
        'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
      )
      expect(input.getAttribute('value')).toBe('first');
    });

    it('preserves the value property', () => {
      renderInputWithStringThenWithUndefined();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'A component is changing a controlled input to be uncontrolled. ' +
        'This is likely caused by the value changing from a defined to ' +
        'undefined, which should not happen. ' +
        'Decide between using a controlled or uncontrolled input ' +
        'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
      )
      expect(input.value).toBe('latest');
    });
  })

  describe('setting a controlled input to null', () => {
    let input;

    function renderInputWithStringThenWithNull() {
      let setValueToNull;
      @view()
      class Input {
        constructor() {
          setValueToNull = () => {
            this.value = null;
          }
        }
        @reactive()
        value = 'first';
        render() {
          return (
            <input
              onChange={e => this.value = e.target.value}
              value={this.value}
            />
          );
        }
      }

      application.start();
      const stub = cocoMvc.render(<Input />, container);
      input = cocoMvc.findDOMNode(stub);
      setUntrackedValue.call(input, 'latest');
      dispatchEventOnNode(input, 'input');
      setValueToNull();
    }

    it('reverts the value attribute to the initial value', () => {
      renderInputWithStringThenWithNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '`value` prop on `%s` should not be null. ' +
        'Consider using an empty string to clear the component or `undefined` ' +
        'for uncontrolled components.',
        'input',
      );
      expect(input.getAttribute('value')).toBe('first');
    });

    it('preserves the value property', () => {
      renderInputWithStringThenWithNull();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '`value` prop on `%s` should not be null. ' +
        'Consider using an empty string to clear the component or `undefined` ' +
        'for uncontrolled components.',
        'input',
      );
      expect(input.value).toBe('latest');
    });
  });

  describe('When given a Symbol value', function() {
    it('treats initial Symbol value as an empty string', function() {
      cocoMvc.render(
        <input value={Symbol('foobar')} onChange={() => {}} />,
        container,
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'input',
      );
      const node = container.firstChild;

      expect(node.value).toBe('');
      expect(node.getAttribute('value')).toBe('');
    });

    it('treats updated Symbol value as an empty string', function() {
      cocoMvc.render(<input value="foo" onChange={() => {}} />, container);
      cocoMvc.render(
        <input value={Symbol('foobar')} onChange={() => {}} />,
        container,
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'input',
      );
      const node = container.firstChild;

      expect(node.value).toBe('');
      expect(node.getAttribute('value')).toBe('');
    });

    it('treats initial Symbol defaultValue as an empty string', function() {
      cocoMvc.render(<input defaultValue={Symbol('foobar')} />, container);
      const node = container.firstChild;

      expect(node.value).toBe('');
      expect(node.getAttribute('value')).toBe('');
      // TODO: we should warn here.
    });

    it('treats updated Symbol defaultValue as an empty string', function() {
      cocoMvc.render(<input defaultValue="foo" />, container);
      cocoMvc.render(<input defaultValue={Symbol('foobar')} />, container);
      const node = container.firstChild;

      expect(node.value).toBe('foo');
      expect(node.getAttribute('value')).toBe('');
      // TODO: we should warn here.
    });
  })

  describe('When given a function value', function() {
    it('treats initial function value as an empty string', function() {
      cocoMvc.render(
        <input value={() => {}} onChange={() => {}} />,
        container,
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'input',
      );
      const node = container.firstChild;

      expect(node.value).toBe('');
      expect(node.getAttribute('value')).toBe('');
    });

    it('treats updated function value as an empty string', function() {
      cocoMvc.render(<input value="foo" onChange={() => {}} />, container);
      cocoMvc.render(
        <input value={() => {}} onChange={() => {}} />,
        container,
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'input',
      );
      const node = container.firstChild;

      expect(node.value).toBe('');
      expect(node.getAttribute('value')).toBe('');
    });

    it('treats initial function defaultValue as an empty string', function() {
      cocoMvc.render(<input defaultValue={() => {}} />, container);
      const node = container.firstChild;

      expect(node.value).toBe('');
      expect(node.getAttribute('value')).toBe('');
      // TODO: we should warn here.
    });

    it('treats updated function defaultValue as an empty string', function() {
      cocoMvc.render(<input defaultValue="foo" />, container);
      cocoMvc.render(<input defaultValue={() => {}} />, container);
      const node = container.firstChild;

      expect(node.value).toBe('foo');
      expect(node.getAttribute('value')).toBe('');
      // TODO: we should warn here.
    });
  })

  describe('checked inputs without a value property', function() {
    // In absence of a value, radio and checkboxes report a value of "on".
    // Between 16 and 16.2, we assigned a node's value to it's current
    // value in order to "dettach" it from defaultValue. This had the unfortunate
    // side-effect of assigning value="on" to radio and checkboxes
    it('does not add "on" in absence of value on a checkbox', function() {
      cocoMvc.render(
        <input type="checkbox" defaultChecked={true} />,
        container,
      );
      const node = container.firstChild;

      expect(node.value).toBe('on');
      expect(node.hasAttribute('value')).toBe(false);
    });

    it('does not add "on" in absence of value on a radio', function() {
      cocoMvc.render(<input type="radio" defaultChecked={true} />, container);
      const node = container.firstChild;

      expect(node.value).toBe('on');
      expect(node.hasAttribute('value')).toBe(false);
    });
  })
})