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
})