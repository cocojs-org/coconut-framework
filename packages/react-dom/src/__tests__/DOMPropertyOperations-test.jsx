/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 *
 * packages/react-dom/src/__tests__/DOMPropertyOperations-test.js
 */
import { getByRole, getByText, getRoles, waitFor } from '@testing-library/dom';
import * as ReactTestUtils from './test-units/ReactTestUnits';

let cocoMvc;
let Application
let application
let view
let consoleErrorSpy;
describe('DOMPropertyOperations', () => {
  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {})

    cocoMvc = (await import('coco-mvc'));
    Application = cocoMvc.Application;
    view = cocoMvc.view
    application = new Application();
    cocoMvc.registerApplication(application);
  })

  afterEach(() => {
    cocoMvc.unregisterApplication();
    jest.resetModules();

    consoleErrorSpy.mockRestore();
  })

  // Sets a value in a way that React doesn't see,
  // so that a subsequent "change" event will trigger the event handler.
  const setUntrackedValue = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'value',
  ).set;
  const setUntrackedChecked = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    'checked',
  ).set;

  describe('setValueForProperty', () => {
    it('should set values as properties by default', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div title="Tip!" />, container);
      expect(container.firstChild.title).toBe('Tip!');
    });

    it('should set values as attributes if necessary', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div role="#" />, container);
      expect(container.firstChild.getAttribute('role')).toBe('#');
      expect(container.firstChild.role).toBeUndefined();
    });

    it('should set values as namespace attributes if necessary', () => {
      const container = document.createElementNS(
        'http://www.w3.org/2000/svg',
        'svg',
      );
      cocoMvc.render(<image xlinkHref="about:blank" />, container);
      expect(
        container.firstChild.getAttributeNS(
          'http://www.w3.org/1999/xlink',
          'href',
        ),
      ).toBe('about:blank');
    });

    it('should set values as boolean properties', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div disabled="disabled" />, container);
      expect(container.firstChild.getAttribute('disabled')).toBe('');
      cocoMvc.render(<div disabled={true} />, container);
      expect(container.firstChild.getAttribute('disabled')).toBe('');
      cocoMvc.render(<div disabled={false} />, container);
      expect(container.firstChild.getAttribute('disabled')).toBe(null);
      cocoMvc.render(<div disabled={true} />, container);
      cocoMvc.render(<div disabled={null} />, container);
      expect(container.firstChild.getAttribute('disabled')).toBe(null);
      cocoMvc.render(<div disabled={true} />, container);
      cocoMvc.render(<div disabled={undefined} />, container);
      expect(container.firstChild.getAttribute('disabled')).toBe(null);
    });

    it('should convert attribute values to string first', () => {
      // Browsers default to this behavior, but some test environments do not.
      // This ensures that we have consistent behavior.
      const obj = {
        toString: function() {
          return 'css-class';
        },
      };

      const container = document.createElement('div');
      cocoMvc.render(<div className={obj} />, container);
      expect(container.firstChild.getAttribute('class')).toBe('css-class');
    });

    it('should not remove empty attributes for special input properties', () => {
      const container = document.createElement('div');
      cocoMvc.render(<input value="" onChange={() => {}} />, container);
      expect(container.firstChild.getAttribute('value')).toBe('');
      expect(container.firstChild.value).toBe('');
    });

    it('should not remove empty attributes for special option properties', () => {
      const container = document.createElement('div');
      cocoMvc.render(
        <select>
          <option value="">empty</option>
          <option>filled</option>
        </select>,
        container,
      );
      // Regression test for https://github.com/facebook/react/issues/6219
      expect(container.firstChild.firstChild.value).toBe('');
      expect(container.firstChild.lastChild.value).toBe('filled');
    });

    it('should remove for falsey boolean properties', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div allowFullScreen={false} />, container);
      expect(container.firstChild.hasAttribute('allowFullScreen')).toBe(false);
    });

    it('should remove when setting custom attr to null', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div data-foo="bar" />, container);
      expect(container.firstChild.hasAttribute('data-foo')).toBe(true);
      cocoMvc.render(<div data-foo={null} />, container);
      expect(container.firstChild.hasAttribute('data-foo')).toBe(false);
    });

    it('should set className to empty string instead of null', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div className="selected" />, container);
      expect(container.firstChild.className).toBe('selected');
      cocoMvc.render(<div className={null} />, container);
      // className should be '', not 'null' or null (which becomes 'null' in
      // some browsers)
      expect(container.firstChild.className).toBe('');
      expect(container.firstChild.getAttribute('class')).toBe(null);
    });

    it('should remove property properly for boolean properties', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div hidden={true} />, container);
      expect(container.firstChild.hasAttribute('hidden')).toBe(true);
      cocoMvc.render(<div hidden={false} />, container);
      expect(container.firstChild.hasAttribute('hidden')).toBe(false);
    });

    it('should always assign the value attribute for non-inputs', function() {
      const container = document.createElement('div');
      cocoMvc.render(<progress />, container);
      jest.spyOn(container.firstChild, 'setAttribute');
      cocoMvc.render(<progress value={30} />, container);
      cocoMvc.render(<progress value="30" />, container);
      expect(container.firstChild.setAttribute).toHaveBeenCalledTimes(2);
    });

    it('should return the progress to intermediate state on null value', () => {
      const container = document.createElement('div');
      cocoMvc.render(<progress value={30} />, container);
      cocoMvc.render(<progress value={null} />, container);
      // Ensure we move progress back to an indeterminate state.
      // Regression test for https://github.com/facebook/react/issues/6119
      expect(container.firstChild.hasAttribute('value')).toBe(false);
    });

    it('custom elements shouldnt have non-functions for on* attributes treated as event listeners', () => {
      const container = document.createElement('div');
      cocoMvc.render(
        <my-custom-element
          onstring={'hello'}
          onobj={{hello: 'world'}}
          onarray={['one', 'two']}
          ontrue={true}
          onfalse={false}
        />,
        container,
      );
      const customElement = container.querySelector('my-custom-element');
      expect(customElement.getAttribute('onstring')).toBe('hello');
      expect(customElement.getAttribute('onobj')).toBe('[object Object]');
      expect(customElement.getAttribute('onarray')).toBe('one,two');
      expect(customElement.getAttribute('ontrue')).toBe('true');
      expect(customElement.getAttribute('onfalse')).toBe('false',);

      // Dispatch the corresponding event names to make sure that nothing crashes.
      customElement.dispatchEvent(new Event('string'));
      customElement.dispatchEvent(new Event('obj'));
      customElement.dispatchEvent(new Event('array'));
      customElement.dispatchEvent(new Event('true'));
      customElement.dispatchEvent(new Event('false'));
    });

    it('custom elements should still have onClick treated like regular elements', () => {
      let syntheticClickEvent = null;
      const syntheticEventHandler = jest.fn(
        event => (syntheticClickEvent = event),
      );
      let nativeClickEvent = null;
      const nativeEventHandler = jest.fn(event => (nativeClickEvent = event));

      const container = document.createElement('div');
      document.body.appendChild(container);
      cocoMvc.render(<my-custom-element onClick={syntheticEventHandler} />, container);

      const customElement = container.querySelector('my-custom-element');
      customElement.onclick = nativeEventHandler;
      container.querySelector('my-custom-element').click();

      expect(nativeEventHandler).toHaveBeenCalledTimes(1);
      expect(syntheticEventHandler).toHaveBeenCalledTimes(1);
      expect(syntheticClickEvent.nativeEvent).toBe(nativeClickEvent);
    });

    it('custom elements should have working onInput event listeners', () => {
      let reactInputEvent = null;
      const eventHandler = jest.fn(event => (reactInputEvent = event));
      const container = document.createElement('div');
      document.body.appendChild(container);
      cocoMvc.render(<my-custom-element onInput={eventHandler} />, container);
      const customElement = container.querySelector('my-custom-element');
      let expectedHandlerCallCount = 0;

      const inputEvent = new Event('input', {bubbles: true});
      customElement.dispatchEvent(inputEvent);
      expectedHandlerCallCount++;
      expect(eventHandler).toHaveBeenCalledTimes(expectedHandlerCallCount);
      expect(reactInputEvent.nativeEvent).toBe(inputEvent);

      // Also make sure that removing and re-adding the event listener works
      cocoMvc.render(<my-custom-element />, container);
      customElement.dispatchEvent(new Event('input', {bubbles: true}));
      expect(eventHandler).toHaveBeenCalledTimes(expectedHandlerCallCount);
      cocoMvc.render(<my-custom-element onInput={eventHandler} />, container);
      customElement.dispatchEvent(new Event('input', {bubbles: true}));
      expectedHandlerCallCount++;
      expect(eventHandler).toHaveBeenCalledTimes(expectedHandlerCallCount);
    });
  })
})