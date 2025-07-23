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
})
