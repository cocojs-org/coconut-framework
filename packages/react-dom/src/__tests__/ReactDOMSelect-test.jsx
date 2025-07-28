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

describe('ReactDOMSelect', () => {
  let cocoMvc, Application, application, jsx, view, reactive, ref, container, consoleErrorSpy;
  const noop = function() {};

  beforeEach(async () => {
    jest.resetModules();

    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {})

    cocoMvc = (await import('coco-mvc'));
    Application = (await import('coco-mvc')).Application;
    view = (await import('coco-mvc')).view;
    reactive = (await import('coco-mvc')).reactive;
    ref = (await import('coco-mvc')).ref;
    jsx = (await import('coco-mvc')).jsx;
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

  it('should allow setting `defaultValue`', () => {
    const stub = (
      <select defaultValue="giraffe">
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const options = stub.props.children;
    const container = document.createElement('div');
    const node = cocoMvc.render(stub, container);

    expect(node.value).toBe('giraffe');

    // Changing `defaultValue` should do nothing.
    cocoMvc.render(
      <select defaultValue="gorilla">{options}</select>,
      container,
    );
    expect(node.value).toEqual('giraffe');
  });

  it('should not throw with `defaultValue` and without children', () => {
    const stub = <select defaultValue="dummy" />;

    expect(() => {
      ReactTestUtils.renderIntoDocument(stub, cocoMvc);
    }).not.toThrow();
  });

  it('should not control when using `defaultValue`', () => {
    const el = (
      <select defaultValue="giraffe">
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const container = document.createElement('div');
    const node = cocoMvc.render(el, container);

    expect(node.value).toBe('giraffe');

    node.value = 'monkey';
    cocoMvc.render(el, container);
    // Uncontrolled selects shouldn't change the value after first mounting
    expect(node.value).toEqual('monkey');
  });

  it('should allow setting `defaultValue` with multiple', () => {
    const stub = (
      <select multiple={true} defaultValue={['giraffe', 'gorilla']}>
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const options = stub.props.children;
    const container = document.createElement('div');
    const node = cocoMvc.render(stub, container);

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(true); // giraffe
    expect(node.options[2].selected).toBe(true); // gorilla

    // Changing `defaultValue` should do nothing.
    cocoMvc.render(
      <select multiple={true} defaultValue={['monkey']}>
        {options}
      </select>,
      container,
    );

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(true); // giraffe
    expect(node.options[2].selected).toBe(true); // gorilla
  });

  it('should allow setting `value`', () => {
    const stub = (
      <select value="giraffe" onChange={noop}>
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const options = stub.props.children;
    const container = document.createElement('div');
    const node = cocoMvc.render(stub, container);

    expect(node.value).toBe('giraffe');

    // Changing the `value` prop should change the selected option.
    cocoMvc.render(
      <select value="gorilla" onChange={noop}>
        {options}
      </select>,
      container,
    );
    expect(node.value).toEqual('gorilla');
  });

  it('should default to the first non-disabled option', () => {
    const stub = (
      <select defaultValue="">
        <option disabled={true}>Disabled</option>
        <option disabled={true}>Still Disabled</option>
        <option>0</option>
        <option disabled={true}>Also Disabled</option>
      </select>
    );
    const container = document.createElement('div');
    const node = cocoMvc.render(stub, container);
    expect(node.options[0].selected).toBe(false);
    expect(node.options[2].selected).toBe(true);
  });

  it('should allow setting `value` to __proto__', () => {
    const stub = (
      <select value="__proto__" onChange={noop}>
        <option value="monkey">A monkey!</option>
        <option value="__proto__">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const options = stub.props.children;
    const container = document.createElement('div');
    const node = cocoMvc.render(stub, container);

    expect(node.value).toBe('__proto__');

    // Changing the `value` prop should change the selected option.
    cocoMvc.render(
      <select value="gorilla" onChange={noop}>
        {options}
      </select>,
      container,
    );
    expect(node.value).toEqual('gorilla');
  });

  it('should not throw with `value` and without children', () => {
    const stub = <select value="dummy" onChange={noop} />;

    expect(() => {
      ReactTestUtils.renderIntoDocument(stub, cocoMvc);
    }).not.toThrow();
  });

  it('should allow setting `value` with multiple', () => {
    const stub = (
      <select multiple={true} value={['giraffe', 'gorilla']} onChange={noop}>
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const options = stub.props.children;
    const container = document.createElement('div');
    const node = cocoMvc.render(stub, container);

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(true); // giraffe
    expect(node.options[2].selected).toBe(true); // gorilla

    // Changing the `value` prop should change the selected options.
    cocoMvc.render(
      <select multiple={true} value={['monkey']} onChange={noop}>
        {options}
      </select>,
      container,
    );

    expect(node.options[0].selected).toBe(true); // monkey
    expect(node.options[1].selected).toBe(false); // giraffe
    expect(node.options[2].selected).toBe(false); // gorilla
  });

  it('should allow setting `value` to __proto__ with multiple', () => {
    const stub = (
      <select multiple={true} value={['__proto__', 'gorilla']} onChange={noop}>
        <option value="monkey">A monkey!</option>
        <option value="__proto__">A __proto__!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const options = stub.props.children;
    const container = document.createElement('div');
    const node = cocoMvc.render(stub, container);

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(true); // __proto__
    expect(node.options[2].selected).toBe(true); // gorilla

    // Changing the `value` prop should change the selected options.
    cocoMvc.render(
      <select multiple={true} value={['monkey']} onChange={noop}>
        {options}
      </select>,
      container,
    );

    expect(node.options[0].selected).toBe(true); // monkey
    expect(node.options[1].selected).toBe(false); // __proto__
    expect(node.options[2].selected).toBe(false); // gorilla
  });

  it('should not select other options automatically', () => {
    const stub = (
      <select multiple={true} value={['12']} onChange={noop}>
        <option value="1">one</option>
        <option value="2">two</option>
        <option value="12">twelve</option>
      </select>
    );
    const node = ReactTestUtils.renderIntoDocument(stub, cocoMvc);

    expect(node.options[0].selected).toBe(false); // one
    expect(node.options[1].selected).toBe(false); // two
    expect(node.options[2].selected).toBe(true); // twelve
  });

  it('should reset child options selected when they are changed and `value` is set', () => {
    const stub = <select multiple={true} value={['a', 'b']} onChange={noop} />;
    const container = document.createElement('div');
    const node = cocoMvc.render(stub, container);

    cocoMvc.render(
      <select multiple={true} value={['a', 'b']} onChange={noop}>
        <option value="a">a</option>
        <option value="b">b</option>
        <option value="c">c</option>
      </select>,
      container,
    );

    expect(node.options[0].selected).toBe(true); // a
    expect(node.options[1].selected).toBe(true); // b
    expect(node.options[2].selected).toBe(false); // c
  });

  it('should allow setting `value` with `objectToString`', () => {
    const objectToString = {
      animal: 'giraffe',
      toString: function() {
        return this.animal;
      },
    };

    const el = (
      <select multiple={true} value={[objectToString]} onChange={noop}>
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const container = document.createElement('div');
    const node = cocoMvc.render(el, container);

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(true); // giraffe
    expect(node.options[2].selected).toBe(false); // gorilla

    // Changing the `value` prop should change the selected options.
    objectToString.animal = 'monkey';

    const el2 = (
      <select multiple={true} value={[objectToString]}>
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    cocoMvc.render(el2, container);

    expect(node.options[0].selected).toBe(true); // monkey
    expect(node.options[1].selected).toBe(false); // giraffe
    expect(node.options[2].selected).toBe(false); // gorilla
  });

  it('should allow switching to multiple', () => {
    const stub = (
      <select defaultValue="giraffe">
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const options = stub.props.children;
    const container = document.createElement('div');
    const node = cocoMvc.render(stub, container);

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(true); // giraffe
    expect(node.options[2].selected).toBe(false); // gorilla

    // When making it multiple, giraffe and gorilla should be selected
    cocoMvc.render(
      <select multiple={true} defaultValue={['giraffe', 'gorilla']}>
        {options}
      </select>,
      container,
    );

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(true); // giraffe
    expect(node.options[2].selected).toBe(true); // gorilla
  });

  it('should allow switching from multiple', () => {
    const stub = (
      <select multiple={true} defaultValue={['giraffe', 'gorilla']}>
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const options = stub.props.children;
    const container = document.createElement('div');
    const node = cocoMvc.render(stub, container);

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(true); // giraffe
    expect(node.options[2].selected).toBe(true); // gorilla

    // When removing multiple, defaultValue is applied again, being omitted
    // means that "monkey" will be selected
    cocoMvc.render(
      <select defaultValue="gorilla">{options}</select>,
      container,
    );

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(false); // giraffe
    expect(node.options[2].selected).toBe(true); // gorilla
  });

  it('does not select an item when size is initially set to greater than 1', () => {
    const stub = (
      <select size="2">
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const container = document.createElement('div');
    const select = cocoMvc.render(stub, container);

    expect(select.options[0].selected).toBe(false);
    expect(select.options[1].selected).toBe(false);
    expect(select.options[2].selected).toBe(false);

    expect(select.value).toBe('');
    expect(select.selectedIndex).toBe(-1);
  });

  it('should remember value when switching to uncontrolled', () => {
    const stub = (
      <select value={'giraffe'} onChange={noop}>
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const options = stub.props.children;
    const container = document.createElement('div');
    const node = cocoMvc.render(stub, container);

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(true); // giraffe
    expect(node.options[2].selected).toBe(false); // gorilla

    cocoMvc.render(<select>{options}</select>, container);

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(true); // giraffe
    expect(node.options[2].selected).toBe(false); // gorilla
  });

  it('should remember updated value when switching to uncontrolled', () => {
    const stub = (
      <select value={'giraffe'} onChange={noop}>
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const options = stub.props.children;
    const container = document.createElement('div');
    const node = cocoMvc.render(stub, container);

    cocoMvc.render(
      <select value="gorilla" onChange={noop}>
        {options}
      </select>,
      container,
    );

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(false); // giraffe
    expect(node.options[2].selected).toBe(true); // gorilla

    cocoMvc.render(<select>{options}</select>, container);

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(false); // giraffe
    expect(node.options[2].selected).toBe(true); // gorilla
  });

  it('should not control defaultValue if re-adding options', () => {
    const container = document.createElement('div');

    const node = cocoMvc.render(
      <select multiple={true} defaultValue={['giraffe']}>
        <option key="monkey" value="monkey">
          A monkey!
        </option>
        <option key="giraffe" value="giraffe">
          A giraffe!
        </option>
        <option key="gorilla" value="gorilla">
          A gorilla!
        </option>
      </select>,
      container,
    );

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(true); // giraffe
    expect(node.options[2].selected).toBe(false); // gorilla

    cocoMvc.render(
      <select multiple={true} defaultValue={['giraffe']}>
        <option key="monkey" value="monkey">
          A monkey!
        </option>
        <option key="gorilla" value="gorilla">
          A gorilla!
        </option>
      </select>,
      container,
    );

    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(false); // gorilla

    cocoMvc.render(
      <select multiple={true} defaultValue={['giraffe']}>
        <option key="monkey" value="monkey">
          A monkey!
        </option>
        <option key="giraffe" value="giraffe">
          A giraffe!
        </option>
        <option key="gorilla" value="gorilla">
          A gorilla!
        </option>
      </select>,
      container,
    );
    
    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(false); // giraffe
    expect(node.options[2].selected).toBe(false); // gorilla
  });

  it('should support options with dynamic children', () => {
    const container = document.createElement('div');
    let node

    cocoMvc.render(<select value={"monkey"} ref={n => { node = n }} onChange={noop}>
      <option key="monkey" value="monkey">
        A monkey is chosen!
      </option>
      <option key="giraffe" value="giraffe">
        A giraffe!
      </option>
      <option key="gorilla" value="gorilla">
        A gorilla!
      </option>
    </select>, container);
    expect(node.options[0].selected).toBe(true); // monkey
    expect(node.options[1].selected).toBe(false); // giraffe
    expect(node.options[2].selected).toBe(false); // gorilla

    cocoMvc.render(<select value={"giraffe"} ref={n => { node = n }} onChange={noop}>
      <option key="monkey" value="monkey">
        A monkey!
      </option>
      <option key="giraffe" value="giraffe">
        A giraffe is chosen!
      </option>
      <option key="gorilla" value="gorilla">
        A gorilla!
      </option>
    </select>, container);
    expect(node.options[0].selected).toBe(false); // monkey
    expect(node.options[1].selected).toBe(true); // giraffe
    expect(node.options[2].selected).toBe(false); // gorilla
  });

  it('should warn if value is null', () => {
    ReactTestUtils.renderIntoDocument(
      <select value={null}>
        <option value="test" />
      </select>,
      cocoMvc
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '`value` prop on `%s` should not be null. ' +
      'Consider using an empty string to clear the component or `undefined` ' +
      'for uncontrolled components.',
      'select',
    );
    ReactTestUtils.renderIntoDocument(
      <select value={null}>
        <option value="test" />
      </select>,
      cocoMvc
    );
    expect(consoleErrorSpy).toBeCalledTimes(1)
  });

  it('should warn if selected is set on <option>', () => {
    ReactTestUtils.renderIntoDocument(
      <select>
        <option selected={true} />
        <option selected={true} />
      </select>,
      cocoMvc
    )
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Use the `defaultValue` or `value` props on <select> instead of ' +
      'setting `selected` on <option>.'
    )
  });

  it('should warn if value is null and multiple is true', () => {
    ReactTestUtils.renderIntoDocument(
      <select value={null} multiple={true}>
        <option value="test" />
      </select>,
      cocoMvc
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '`value` prop on `%s` should not be null. ' +
      'Consider using an empty array when `multiple` is set to `true` ' +
      'to clear the component or `undefined` for uncontrolled components.',
      'select',
    )
  });

  it('should refresh state on change', () => {
    const stub = (
      <select value="giraffe" onChange={noop}>
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const container = document.createElement('div');
    document.body.appendChild(container);

    try {
      const node = cocoMvc.render(stub, container);

      node.dispatchEvent(
        new Event('change', {bubbles: true, cancelable: false}),
      );

      expect(node.value).toBe('giraffe');
    } finally {
      document.body.removeChild(container);
    }
  });

  it('should warn if value and defaultValue props are specified', () => {
    ReactTestUtils.renderIntoDocument(
      <select value="giraffe" defaultValue="giraffe" readOnly={true}>
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>,
      cocoMvc
    );
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Select elements must be either controlled or uncontrolled ' +
      '(specify either the value prop, or the defaultValue prop, but not ' +
      'both). Decide between using a controlled or uncontrolled select ' +
      'element and remove one of these props. More info: ' +
      'https://reactjs.org/link/controlled-components',
    )
  });

  it('should not warn about missing onChange in uncontrolled textareas', () => {
    const container = document.createElement('div');
    cocoMvc.render(<select />, container);
    cocoMvc.unmountComponentAtNode(container);
    cocoMvc.render(<select value={undefined} />, container);
  });

  it('should be able to safely remove select onChange', () => {
    function changeView() {
      cocoMvc.unmountComponentAtNode(container);
    }

    const container = document.createElement('div');
    const stub = (
      <select value="giraffe" onChange={changeView}>
        <option value="monkey">A monkey!</option>
        <option value="giraffe">A giraffe!</option>
        <option value="gorilla">A gorilla!</option>
      </select>
    );
    const node = cocoMvc.render(stub, container);

    // todo Simulate没有实现
    // expect(() => ReactTestUtils.Simulate.change(node)).not.toThrow();
  });

  it('should select grandchild options nested inside an optgroup', () => {
    const stub = (
      <select value="b" onChange={noop}>
        <optgroup label="group">
          <option value="a">a</option>
          <option value="b">b</option>
          <option value="c">c</option>
        </optgroup>
      </select>
    );
    const container = document.createElement('div');
    const node = cocoMvc.render(stub, container);

    expect(node.options[0].selected).toBe(false); // a
    expect(node.options[1].selected).toBe(true); // b
    expect(node.options[2].selected).toBe(false); // c
  });

  it('should allow controlling `value` in a nested render', () => {
    let selectNode;

    @view()
    class Parent {
      @reactive()
      value = 'giraffe'

      viewDidMount() {
        this._renderNested();
      }

      viewDidUpdate() {
        this._renderNested();
      }

      _handleChange = (event) => {
        this.value = event.target.value;
      }

      _renderNested = () => {
        cocoMvc.render(
          <select
            onChange={this._handleChange.bind(this)}
            ref={n => (selectNode = n)}
            value={this.value}>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
            <option value="gorilla">A gorilla!</option>
          </select>,
          this._nestingContainer,
        );
      }

      render() {
        return <div ref={n => (this._nestingContainer = n)} />;
      }
    }

    const container = document.createElement('div');

    document.body.appendChild(container);

    application.start();
    cocoMvc.render(<Parent />, container);

    expect(selectNode.value).toBe('giraffe');

    selectNode.value = 'gorilla';

    let nativeEvent = document.createEvent('Event');
    nativeEvent.initEvent('input', true, true);
    selectNode.dispatchEvent(nativeEvent);

    expect(selectNode.value).toEqual('gorilla');

    nativeEvent = document.createEvent('Event');
    nativeEvent.initEvent('change', true, true);
    selectNode.dispatchEvent(nativeEvent);

    expect(selectNode.value).toEqual('gorilla');

    document.body.removeChild(container);
  });

  it('should not select first option by default when multiple is set and no defaultValue is set', () => {
    const stub = (
      <select multiple={true} onChange={noop}>
        <option value="a">a</option>
        <option value="b">b</option>
        <option value="c">c</option>
      </select>
    );
    const container = document.createElement('div');
    const node = cocoMvc.render(stub, container);

    expect(node.options[0].selected).toBe(false); // a
    expect(node.options[1].selected).toBe(false); // b
    expect(node.options[2].selected).toBe(false); // c
  });

  describe('When given a Symbol value', () => {
    it('treats initial Symbol value as an empty string', () => {
      let node;

      node = ReactTestUtils.renderIntoDocument(
        <select onChange={noop} value={Symbol('foobar')}>
          <option value={Symbol('foobar')}>A Symbol!</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'select',
      );

      expect(node.value).toBe('');
    });

    it('treats updated Symbol value as an empty string', () => {
      let node;

      node = ReactTestUtils.renderIntoDocument(
        <select onChange={noop} value="monkey">
          <option value={Symbol('foobar')}>A Symbol!</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'option',
      );

      expect(node.value).toBe('monkey');

      node = ReactTestUtils.renderIntoDocument(
        <select onChange={noop} value={Symbol('foobar')}>
          <option value={Symbol('foobar')}>A Symbol!</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );

      expect(node.value).toBe('');
    });

    it('treats initial Symbol defaultValue as an empty string', () => {
      let node;

      node = ReactTestUtils.renderIntoDocument(
        <select defaultValue={Symbol('foobar')}>
          <option value={Symbol('foobar')}>A Symbol!</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'option',
      );

      expect(node.value).toBe('');
    });

    it('treats updated Symbol defaultValue as an empty string', () => {
      let node;

      node = ReactTestUtils.renderIntoDocument(
        <select defaultValue="monkey">
          <option value={Symbol('foobar')}>A Symbol!</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'option',
      );

      expect(node.value).toBe('monkey');

      node = ReactTestUtils.renderIntoDocument(
        <select defaultValue={Symbol('foobar')}>
          <option value={Symbol('foobar')}>A Symbol!</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );

      expect(node.value).toBe('');
    });
  })

  describe('When given a function value', () => {
    it('treats initial function value as an empty string', () => {
      let node;

      node = ReactTestUtils.renderIntoDocument(
        <select onChange={noop} value={() => {}}>
          <option value={() => {}}>A function!</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'option',
      );

      expect(node.value).toBe('');
    });

    it('treats initial function defaultValue as an empty string', () => {
      let node;

      node = ReactTestUtils.renderIntoDocument(
        <select defaultValue={() => {}}>
          <option value={() => {}}>A function!</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'option',
      );

      expect(node.value).toBe('');
    });

    it('treats updated function value as an empty string', () => {
      let node;

      node = ReactTestUtils.renderIntoDocument(
        <select onChange={noop} value="monkey">
          <option value={() => {}}>A function!</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'option',
      );

      expect(node.value).toBe('monkey');

      node = ReactTestUtils.renderIntoDocument(
        <select onChange={noop} value={() => {}}>
          <option value={() => {}}>A function!</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );

      expect(node.value).toBe('');
    });

    it('treats updated function defaultValue as an empty string', () => {
      let node;

      node = ReactTestUtils.renderIntoDocument(
        <select defaultValue="monkey">
          <option value={() => {}}>A function!</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`value`',
        'option',
      );

      expect(node.value).toBe('monkey');

      node = ReactTestUtils.renderIntoDocument(
        <select defaultValue={() => {}}>
          <option value={() => {}}>A function!</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );

      expect(node.value).toBe('');
    });
  })

  describe('When given a Temporal.PlainDate-like value', () => {
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

    it('throws when given a Temporal.PlainDate-like value (select)', () => {
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} value={new TemporalLike()}>
            <option value="2020-01-01">like a Temporal.PlainDate</option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Form field values (value, checked, defaultValue, or defaultChecked props)' +
        ' must be strings, not %s.' +
        ' This value must be coerced to a string before before using it here.',
        'TemporalLike'
      );
    })

    it('throws when given a Temporal.PlainDate-like value (option)', () => {
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} value="2020-01-01">
            <option value={new TemporalLike()}>
              like a Temporal.PlainDate
            </option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'The provided `%s` attribute is an unsupported type %s.' +
        ' This value must be coerced to a string before before using it here.',
        'value',
        'TemporalLike'
      );
    });

    it('throws when given a Temporal.PlainDate-like value (both)', () => {
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} value={new TemporalLike()}>
            <option value={new TemporalLike()}>
              like a Temporal.PlainDate
            </option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'The provided `%s` attribute is an unsupported type %s.' +
        ' This value must be coerced to a string before before using it here.',
        'value',
        'TemporalLike'
      );
    });

    it('throws with updated Temporal.PlainDate-like value (select)', () => {
      ReactTestUtils.renderIntoDocument(
        <select onChange={noop} value="monkey">
          <option value="2020-01-01">like a Temporal.PlainDate</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} value={new TemporalLike()}>
            <option value="2020-01-01">like a Temporal.PlainDate</option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Form field values (value, checked, defaultValue, or defaultChecked props)' +
        ' must be strings, not %s.' +
        ' This value must be coerced to a string before before using it here.',
        'TemporalLike'
      );
    });

    it('throws with updated Temporal.PlainDate-like value (option)', () => {
      ReactTestUtils.renderIntoDocument(
        <select onChange={noop} value="2020-01-01">
          <option value="donkey">like a Temporal.PlainDate</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} value="2020-01-01">
            <option value={new TemporalLike()}>
              like a Temporal.PlainDate
            </option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'The provided `%s` attribute is an unsupported type %s.' +
        ' This value must be coerced to a string before before using it here.',
        'value',
        'TemporalLike'
      );
    });

    it('throws with updated Temporal.PlainDate-like value (both)', () => {
      ReactTestUtils.renderIntoDocument(
        <select onChange={noop} value="donkey">
          <option value="donkey">like a Temporal.PlainDate</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} value={new TemporalLike()}>
            <option value={new TemporalLike()}>
              like a Temporal.PlainDate
            </option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'The provided `%s` attribute is an unsupported type %s.' +
        ' This value must be coerced to a string before before using it here.',
        'value',
        'TemporalLike'
      );
    });

    it('throws when given a Temporal.PlainDate-like defaultValue (select)', () => {
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} defaultValue={new TemporalLike()}>
            <option value="2020-01-01">like a Temporal.PlainDate</option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Form field values (value, checked, defaultValue, or defaultChecked props)' +
        ' must be strings, not %s.' +
        ' This value must be coerced to a string before before using it here.',
        'TemporalLike'
      );
    });

    it('throws when given a Temporal.PlainDate-like value (option)', () => {
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} value="2020-01-01">
            <option value={new TemporalLike()}>
              like a Temporal.PlainDate
            </option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'The provided `%s` attribute is an unsupported type %s.' +
        ' This value must be coerced to a string before before using it here.',
        'value',
        'TemporalLike'
      );
    });

    it('throws when given a Temporal.PlainDate-like value (both)', () => {
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} value={new TemporalLike()}>
            <option value={new TemporalLike()}>
              like a Temporal.PlainDate
            </option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'The provided `%s` attribute is an unsupported type %s.' +
        ' This value must be coerced to a string before before using it here.',
        'value',
        'TemporalLike'
      );
    });

    it('throws with updated Temporal.PlainDate-like value (select)', () => {
      ReactTestUtils.renderIntoDocument(
        <select onChange={noop} value="monkey">
          <option value="2020-01-01">like a Temporal.PlainDate</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} value={new TemporalLike()}>
            <option value="2020-01-01">like a Temporal.PlainDate</option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Form field values (value, checked, defaultValue, or defaultChecked props)' +
        ' must be strings, not %s.' +
        ' This value must be coerced to a string before before using it here.',
        'TemporalLike'
      );
    });

    it('throws with updated Temporal.PlainDate-like value (option)', () => {
      ReactTestUtils.renderIntoDocument(
        <select onChange={noop} value="2020-01-01">
          <option value="donkey">like a Temporal.PlainDate</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} value="2020-01-01">
            <option value={new TemporalLike()}>
              like a Temporal.PlainDate
            </option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'The provided `%s` attribute is an unsupported type %s.' +
        ' This value must be coerced to a string before before using it here.',
        'value',
        'TemporalLike'
      );
    });

    it('throws with updated Temporal.PlainDate-like value (both)', () => {
      ReactTestUtils.renderIntoDocument(
        <select onChange={noop} value="donkey">
          <option value="donkey">like a Temporal.PlainDate</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} value={new TemporalLike()}>
            <option value={new TemporalLike()}>
              like a Temporal.PlainDate
            </option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'The provided `%s` attribute is an unsupported type %s.' +
        ' This value must be coerced to a string before before using it here.',
        'value',
        'TemporalLike'
      );
    });

    it('throws when given a Temporal.PlainDate-like defaultValue (select)', () => {
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} defaultValue={new TemporalLike()}>
            <option value="2020-01-01">like a Temporal.PlainDate</option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Form field values (value, checked, defaultValue, or defaultChecked props)' +
        ' must be strings, not %s.' +
        ' This value must be coerced to a string before before using it here.',
        'TemporalLike'
      );
    });

    it('throws when given a Temporal.PlainDate-like defaultValue (option)', () => {
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} defaultValue="2020-01-01">
            <option value={new TemporalLike()}>
              like a Temporal.PlainDate
            </option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'The provided `%s` attribute is an unsupported type %s.' +
        ' This value must be coerced to a string before before using it here.',
        'value',
        'TemporalLike'
      );
    });

    it('throws when given a Temporal.PlainDate-like value (both)', () => {
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} defaultValue={new TemporalLike()}>
            <option value={new TemporalLike()}>
              like a Temporal.PlainDate
            </option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'The provided `%s` attribute is an unsupported type %s.' +
        ' This value must be coerced to a string before before using it here.',
        'value',
        'TemporalLike'
      );
    });

    it('throws with updated Temporal.PlainDate-like defaultValue (select)', () => {
      ReactTestUtils.renderIntoDocument(
        <select onChange={noop} defaultValue="monkey">
          <option value="2020-01-01">like a Temporal.PlainDate</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} defaultValue={new TemporalLike()}>
            <option value="2020-01-01">like a Temporal.PlainDate</option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Form field values (value, checked, defaultValue, or defaultChecked props)' +
        ' must be strings, not %s.' +
        ' This value must be coerced to a string before before using it here.',
        'TemporalLike'
      );
    });

    it('throws with updated Temporal.PlainDate-like defaultValue (both)', () => {
      ReactTestUtils.renderIntoDocument(
        <select onChange={noop} defaultValue="monkey">
          <option value="donkey">like a Temporal.PlainDate</option>
          <option value="monkey">A monkey!</option>
          <option value="giraffe">A giraffe!</option>
        </select>,
        cocoMvc
      );
      const test = () => {
        ReactTestUtils.renderIntoDocument(
          <select onChange={noop} value={new TemporalLike()}>
            <option value={new TemporalLike()}>
              like a Temporal.PlainDate
            </option>
            <option value="monkey">A monkey!</option>
            <option value="giraffe">A giraffe!</option>
          </select>,
          cocoMvc
        );
      };
      expect(test).toThrowError(new TypeError('prod message'));
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'The provided `%s` attribute is an unsupported type %s.' +
        ' This value must be coerced to a string before before using it here.',
        'value',
        'TemporalLike'
      );
    });
  })
})
