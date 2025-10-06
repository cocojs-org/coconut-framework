/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';
import * as ReactTestUtils from './test-units/ReactTestUnits';


describe('ReactDOMTextarea', () => {
  function emptyFunction() {}
  let cocoMvc;
  let Application;
  let application;
  let view;
  let reactive;
  let ref;
  let renderTextarea;
  let consoleErrorSpy;
  let getMetaClassById;

  beforeEach(async () => {
    jest.resetModules();

    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {})

    cocoMvc = (await import('coco-mvc'));
    Application = cocoMvc.Application;
    view = cocoMvc.view;
    reactive = cocoMvc.reactive;
    ref = cocoMvc.ref;
    getMetaClassById = cocoMvc.getMetaClassById;
    application = new Application();
    cocoMvc.registerMvcApi(application, getMetaClassById);

    renderTextarea = function(component, container) {
      if (!container) {
        container = document.createElement('div');
      }
      const node = cocoMvc.render(component, container);

      // Fixing jsdom's quirky behavior -- in reality, the parser should strip
      // off the leading newline but we need to do it by hand here.
      node.defaultValue = node.innerHTML.replace(/^\n/, '');
      return node;
    };
  })
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterMvcApi();
    consoleErrorSpy.mockRestore();
  })

  it('should allow setting `defaultValue`', () => {
    const container = document.createElement('div');
    const node = renderTextarea(<textarea defaultValue="giraffe" />, container);

    expect(node.value).toBe('giraffe');

    // Changing `defaultValue` should do nothing.
    renderTextarea(<textarea defaultValue="gorilla" />, container);
    expect(node.value).toEqual('giraffe');

    node.value = 'cat';

    renderTextarea(<textarea defaultValue="monkey" />, container);
    expect(node.value).toEqual('cat');
  });

  it('should display `defaultValue` of number 0', () => {
    const stub = <textarea defaultValue={0} />;
    const node = renderTextarea(stub);

    expect(node.value).toBe('0');
  });

  it('should display "false" for `defaultValue` of `false`', () => {
    const stub = <textarea defaultValue={false} />;
    const node = renderTextarea(stub);

    expect(node.value).toBe('false');
  });

  it('should display "foobar" for `defaultValue` of `objToString`', () => {
    const objToString = {
      toString: function() {
        return 'foobar';
      },
    };

    const stub = <textarea defaultValue={objToString} />;
    const node = renderTextarea(stub);

    expect(node.value).toBe('foobar');
  });

  it('should set defaultValue', () => {
    const container = document.createElement('div');
    cocoMvc.render(<textarea defaultValue="foo" />, container);
    cocoMvc.render(<textarea defaultValue="bar" />, container);
    cocoMvc.render(<textarea defaultValue="noise" />, container);
    expect(container.firstChild.defaultValue).toBe('noise');
  });

  it('should not render value as an attribute', () => {
    const stub = <textarea value="giraffe" onChange={emptyFunction} />;
    const node = renderTextarea(stub);

    expect(node.getAttribute('value')).toBe(null);
  });

  it('should display `value` of number 0', () => {
    const stub = <textarea value={0} onChange={emptyFunction} />;
    const node = renderTextarea(stub);

    expect(node.value).toBe('0');
  });

  it('should update defaultValue to empty string', () => {
    const container = document.createElement('div');
    cocoMvc.render(<textarea defaultValue={'foo'} />, container);
    cocoMvc.render(<textarea defaultValue={''} />, container);
    expect(container.firstChild.defaultValue).toBe('');
  });

  it('should allow setting `value` to `giraffe`', () => {
    const container = document.createElement('div');
    let stub = <textarea value="giraffe" onChange={emptyFunction} />;
    const node = renderTextarea(stub, container);

    expect(node.value).toBe('giraffe');

    stub = cocoMvc.render(
      <textarea value="gorilla" onChange={emptyFunction} />,
      container,
    );
    expect(node.value).toEqual('gorilla');
  });

  it('will not initially assign an empty value (covers case where firefox throws a validation error when required attribute is set)', () => {
    const container = document.createElement('div');

    let counter = 0;
    const originalCreateElement = document.createElement;
    jest.spyOn(document, 'createElement').mockImplementation((function(type) {
      const el = originalCreateElement.apply(this, arguments);
      let value = '';
      if (type === 'textarea') {
        Object.defineProperty(el, 'value', {
          get: function() {
            return value;
          },
          set: function(val) {
            value = String(val);
            counter++;
          },
        });
      }
      return el;
    }));

    cocoMvc.render(<textarea value="" readOnly={true} />, container);
    expect(counter).toEqual(0);

    document.createElement = originalCreateElement;
  });

  it('should allow setting `value` to `true`', () => {
    const container = document.createElement('div');
    let stub = <textarea value="giraffe" onChange={emptyFunction} />;
    const node = renderTextarea(stub, container);

    expect(node.value).toBe('giraffe');

    stub = cocoMvc.render(
      <textarea value={true} onChange={emptyFunction} />,
      container,
    );
    expect(node.value).toEqual('true');
  });

  it('should allow setting `value` to `false`', () => {
    const container = document.createElement('div');
    let stub = <textarea value="giraffe" onChange={emptyFunction} />;
    const node = renderTextarea(stub, container);

    expect(node.value).toBe('giraffe');

    stub = cocoMvc.render(
      <textarea value={false} onChange={emptyFunction} />,
      container,
    );
    expect(node.value).toEqual('false');
  });

  it('should allow setting `value` to `objToString`', () => {
    const container = document.createElement('div');
    let stub = <textarea value="giraffe" onChange={emptyFunction} />;
    const node = renderTextarea(stub, container);

    expect(node.value).toBe('giraffe');

    const objToString = {
      toString: function() {
        return 'foo';
      },
    };
    stub = cocoMvc.render(
      <textarea value={objToString} onChange={emptyFunction} />,
      container,
    );
    expect(node.value).toEqual('foo');
  });

  it('should throw when value is set to a Temporal-like object', () => {
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
    const container = document.createElement('div');
    const stub = <textarea value="giraffe" onChange={emptyFunction} />;
    const node = renderTextarea(stub, container);

    expect(node.value).toBe('giraffe');

    const test = () =>
      cocoMvc.render(
        <textarea value={new TemporalLike()} onChange={emptyFunction} />,
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

  it('should take updates to `defaultValue` for uncontrolled textarea', () => {
    const container = document.createElement('div');

    const node = cocoMvc.render(<textarea defaultValue="0" />, container);

    expect(node.value).toBe('0');

    cocoMvc.render(<textarea defaultValue="1" />, container);

    expect(node.value).toBe('0');
  });

  it('should take updates to children in lieu of `defaultValue` for uncontrolled textarea', () => {
    const container = document.createElement('div');

    const node = cocoMvc.render(<textarea defaultValue="0" />, container);

    expect(node.value).toBe('0');

    cocoMvc.render(<textarea>1</textarea>, container);

    expect(node.value).toBe('0');
  });

  it('should not incur unnecessary DOM mutations', () => {
    const container = document.createElement('div');
    cocoMvc.render(<textarea value="a" onChange={emptyFunction} />, container);

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

    cocoMvc.render(<textarea value="a" onChange={emptyFunction} />, container);
    expect(nodeValueSetter).toHaveBeenCalledTimes(0);

    cocoMvc.render(<textarea value="b" onChange={emptyFunction} />, container);
    expect(nodeValueSetter).toHaveBeenCalledTimes(1);
  });

  it('should properly control a value of number `0`', () => {
    const stub = <textarea value={0} onChange={emptyFunction} />;
    const setUntrackedValue = Object.getOwnPropertyDescriptor(
      HTMLTextAreaElement.prototype,
      'value',
    ).set;

    const container = document.createElement('div');
    document.body.appendChild(container);

    try {
      const node = renderTextarea(stub, container);

      setUntrackedValue.call(node, 'giraffe');
      node.dispatchEvent(
        new Event('input', {bubbles: true, cancelable: false}),
      );
      expect(node.value).toBe('0');
    } finally {
      document.body.removeChild(container);
    }
  });

  it('should treat children like `defaultValue`', () => {
    const container = document.createElement('div');
    let stub = <textarea>giraffe</textarea>;
    let node;

    node = renderTextarea(stub, container);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Use the `defaultValue` or `value` props instead of setting ' +
      'children on <textarea>.',
    );

    expect(node.value).toBe('giraffe');

    // Changing children should do nothing, it functions like `defaultValue`.
    stub = cocoMvc.render(<textarea>gorilla</textarea>, container);
    expect(node.value).toEqual('giraffe');
  });

  it('should keep value when switching to uncontrolled element if not changed', () => {
    const container = document.createElement('div');

    const node = renderTextarea(
      <textarea value="kitten" onChange={emptyFunction} />,
      container,
    );

    expect(node.value).toBe('kitten');

    cocoMvc.render(<textarea defaultValue="gorilla" />, container);

    expect(node.value).toEqual('kitten');
  });

  it('should keep value when switching to uncontrolled element if changed', () => {
    const container = document.createElement('div');

    const node = renderTextarea(
      <textarea value="kitten" onChange={emptyFunction} />,
      container,
    );

    expect(node.value).toBe('kitten');

    cocoMvc.render(
      <textarea value="puppies" onChange={emptyFunction} />,
      container,
    );

    expect(node.value).toBe('puppies');

    cocoMvc.render(<textarea defaultValue="gorilla" />, container);

    expect(node.value).toEqual('puppies');
  });

  it('should allow numbers as children', () => {
    let node;
    node = renderTextarea(<textarea>{17}</textarea>);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Use the `defaultValue` or `value` props instead of setting ' +
      'children on <textarea>.',
    );
    expect(node.value).toBe('17');
  });

  it('should allow booleans as children', () => {
    let node;
    node = renderTextarea(<textarea>{false}</textarea>);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Use the `defaultValue` or `value` props instead of setting ' +
      'children on <textarea>.',
    );
    expect(node.value).toBe('false');
  });

  it('should allow objects as children', () => {
    const obj = {
      toString: function() {
        return 'sharkswithlasers';
      },
    };
    let node = renderTextarea(<textarea>{obj}</textarea>);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Use the `defaultValue` or `value` props instead of setting ' +
      'children on <textarea>.',
    );
    expect(node.value).toBe('sharkswithlasers');
  });

  it('should throw with multiple or invalid children', () => {
    expect(() =>
      ReactTestUtils.renderIntoDocument(
        <textarea>{'hello'}{'there'}</textarea>,
        cocoMvc
      ),
    ).toThrow('<textarea> can only have at most one child');
    expect(consoleErrorSpy.mock.calls[0]).toEqual(
      [
        'Use the `defaultValue` or `value` props instead of setting ' +
        'children on <textarea>.',
      ]
    );

    let node;
    expect(
      () =>
        (node = renderTextarea(
          <textarea><strong /></textarea>,
        )),
    ).not.toThrow();
    expect(consoleErrorSpy.mock.calls[1]).toEqual(
      [
        'Use the `defaultValue` or `value` props instead of setting ' +
        'children on <textarea>.',
      ]
    );
    expect(node.value).toBe('[object Object]');
  });

  it('should unmount', () => {
    const container = document.createElement('div');
    renderTextarea(<textarea />, container);
    cocoMvc.unmountComponentAtNode(container);
  });

  it('should warn if value is null', () => {
    ReactTestUtils.renderIntoDocument(<textarea value={null} />, cocoMvc);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '`value` prop on `%s` should not be null. ' +
      'Consider using an empty string to clear the component or `undefined` ' +
      'for uncontrolled components.',
      'textarea',
    );

    // No additional warnings are expected
    ReactTestUtils.renderIntoDocument(<textarea value={null} />, cocoMvc);
  });

  it('should warn if value and defaultValue are specified', () => {
    ReactTestUtils.renderIntoDocument(<textarea value="foo" defaultValue="bar" readOnly={true} />, cocoMvc);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '%s contains a textarea with both value and defaultValue props. ' +
      'Textarea elements must be either controlled or uncontrolled ' +
      '(specify either the value prop, or the defaultValue prop, but not ' +
      'both). Decide between using a controlled or uncontrolled textarea ' +
      'and remove one of these props. More info: ' +
      'https://reactjs.org/link/controlled-components',
      'A component',
    );

    // No additional warnings are expected
    ReactTestUtils.renderIntoDocument(<textarea value="foo" defaultValue="bar" readOnly={true} />, cocoMvc);
    expect(consoleErrorSpy).toBeCalledTimes(1)
  });

  it('should not warn about missing onChange in uncontrolled textareas', () => {
    const container = document.createElement('div');
    cocoMvc.render(<textarea />, container);
    cocoMvc.unmountComponentAtNode(container);
    cocoMvc.render(<textarea value={undefined} />, container);
  });

  it('does not set textContent if value is unchanged', () => {
    const container = document.createElement('div');
    let node;
    let instance;
    // Setting defaultValue on a textarea is equivalent to setting textContent,
    // and is the method we currently use, so we can observe if defaultValue is
    // is set to determine if textContent is being recreated.
    // https://html.spec.whatwg.org/#the-textarea-element
    let defaultValue;
    const set = jest.fn(value => {
      defaultValue = value;
    });
    const get = jest.fn(value => {
      return defaultValue;
    });
    @view()
    class App {
      @reactive()
      count = 0;
      viewDidMount() {
        instance = this;
      }
      render() {
        return (
          <div>
            <span>{this.count}</span>
            <textarea
              ref={n => (node = n)}
              value="foo"
              onChange={emptyFunction}
            />
          </div>
        );
      }
    }
    application.start();
    cocoMvc.render(<App />, container);
    defaultValue = node.defaultValue;
    Object.defineProperty(node, 'defaultValue', {get, set});
    instance.count = 1;
    expect(set.mock.calls.length).toBe(0);
  });

  describe('When given a Symbol value', () => {
    it('treats initial Symbol value as an empty string', () => {
      const container = document.createElement('div');
      cocoMvc.render(
        <textarea value={Symbol('foobar')} onChange={() => {}} />,
        container,
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'textarea',
      );
      const node = container.firstChild;

      expect(node.value).toBe('');
    });

    it('treats initial Symbol children as an empty string', () => {
      const container = document.createElement('div');
      cocoMvc.render(
        <textarea onChange={() => {}}>{Symbol('foo')}</textarea>,
        container,
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Use the `defaultValue` or `value` props instead of setting ' +
        'children on <textarea>.',
      );
      const node = container.firstChild;

      expect(node.value).toBe('');
    });

    it('treats updated Symbol value as an empty string', () => {
      const container = document.createElement('div');
      cocoMvc.render(<textarea value="foo" onChange={() => {}} />, container);
      cocoMvc.render(
        <textarea value={Symbol('foo')} onChange={() => {}} />,
        container,
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'textarea',
      );
      const node = container.firstChild;

      expect(node.value).toBe('');
    });

    it('treats initial Symbol defaultValue as an empty string', () => {
      const container = document.createElement('div');
      cocoMvc.render(<textarea defaultValue={Symbol('foobar')} />, container);
      const node = container.firstChild;

      // TODO: defaultValue is a reserved prop and is not validated. Check warnings when they are.
      expect(node.value).toBe('');
    });

    it('treats updated Symbol defaultValue as an empty string', () => {
      const container = document.createElement('div');
      cocoMvc.render(<textarea defaultValue="foo" />, container);
      cocoMvc.render(<textarea defaultValue={Symbol('foobar')} />, container);
      const node = container.firstChild;

      // TODO: defaultValue is a reserved prop and is not validated. Check warnings when they are.
      expect(node.value).toBe('foo');
    });
  })

  describe('When given a function value', () => {
    it('treats initial function value as an empty string', () => {
      const container = document.createElement('div');
      cocoMvc.render(
        <textarea value={() => {}} onChange={() => {}} />,
        container,
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'textarea',
      );
      const node = container.firstChild;

      expect(node.value).toBe('');
    });

    it('treats initial function children as an empty string', () => {
      const container = document.createElement('div');
      cocoMvc.render(
        <textarea onChange={() => {}}>{() => {}}</textarea>,
        container,
      );

      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Use the `defaultValue` or `value` props instead of setting ' +
        'children on <textarea>.',
      );
      const node = container.firstChild;

      expect(node.value).toBe('');
    });

    it('treats updated function value as an empty string', () => {
      const container = document.createElement('div');
      cocoMvc.render(<textarea value="foo" onChange={() => {}} />, container);
      cocoMvc.render(
        <textarea value={() => {}} onChange={() => {}} />,
        container,
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'textarea',
      );
      const node = container.firstChild;

      expect(node.value).toBe('');
    });

    it('treats initial function defaultValue as an empty string', () => {
      const container = document.createElement('div');
      cocoMvc.render(<textarea defaultValue={() => {}} />, container);
      const node = container.firstChild;

      // TODO: defaultValue is a reserved prop and is not validated. Check warnings when they are.
      expect(node.value).toBe('');
    });

    it('treats updated function defaultValue as an empty string', () => {
      const container = document.createElement('div');
      cocoMvc.render(<textarea defaultValue="foo" />, container);
      cocoMvc.render(<textarea defaultValue={() => {}} />, container);
      const node = container.firstChild;

      // TODO: defaultValue is a reserved prop and is not validated. Check warnings when they are.
      expect(node.value).toBe('foo');
    });
  })
})