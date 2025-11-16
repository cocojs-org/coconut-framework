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

describe('DOMPropertyOperations', () => {
    let cocoMvc;
    let Application;
    let application;
    let view;
    let consoleErrorSpy;
    beforeEach(async () => {
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});

        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        view = cocoMvc.view;
        application = new Application();
        cocoMvc.registerMvcApi(application);
    });

    afterEach(() => {
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
        application.destructor();
        consoleErrorSpy.mockRestore();
    });

    // Sets a value in a way that React doesn't see,
    // so that a subsequent "change" event will trigger the event handler.
    const setUntrackedValue = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
    const setUntrackedChecked = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'checked').set;

    describe('setValueForProperty', () => {
        it('should set values as properties by default', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<div title="Tip!" />, container);
            expect(container.firstChild.title).toBe('Tip!');
        });

        it('should set values as attributes if necessary', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<div role="#" />, container);
            expect(container.firstChild.getAttribute('role')).toBe('#');
            expect(container.firstChild.role).toBeUndefined();
        });

        it('should set values as namespace attributes if necessary', () => {
            const container = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            cocoMvc.renderIntoContainer(<image xlinkHref="about:blank" />, container);
            expect(container.firstChild.getAttributeNS('http://www.w3.org/1999/xlink', 'href')).toBe('about:blank');
        });

        it('should set values as boolean properties', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<div disabled="disabled" />, container);
            expect(container.firstChild.getAttribute('disabled')).toBe('');
            cocoMvc.renderIntoContainer(<div disabled={true} />, container);
            expect(container.firstChild.getAttribute('disabled')).toBe('');
            cocoMvc.renderIntoContainer(<div disabled={false} />, container);
            expect(container.firstChild.getAttribute('disabled')).toBe(null);
            cocoMvc.renderIntoContainer(<div disabled={true} />, container);
            cocoMvc.renderIntoContainer(<div disabled={null} />, container);
            expect(container.firstChild.getAttribute('disabled')).toBe(null);
            cocoMvc.renderIntoContainer(<div disabled={true} />, container);
            cocoMvc.renderIntoContainer(<div disabled={undefined} />, container);
            expect(container.firstChild.getAttribute('disabled')).toBe(null);
        });

        it('should convert attribute values to string first', () => {
            // Browsers default to this behavior, but some test environments do not.
            // This ensures that we have consistent behavior.
            const obj = {
                toString: function () {
                    return 'css-class';
                },
            };

            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<div className={obj} />, container);
            expect(container.firstChild.getAttribute('class')).toBe('css-class');
        });

        it('should not remove empty attributes for special input properties', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<input value="" onChange={() => {}} />, container);
            expect(container.firstChild.getAttribute('value')).toBe('');
            expect(container.firstChild.value).toBe('');
        });

        it('should not remove empty attributes for special option properties', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(
                <select>
                    <option value="">empty</option>
                    <option>filled</option>
                </select>,
                container
            );
            // Regression test for https://github.com/facebook/react/issues/6219
            expect(container.firstChild.firstChild.value).toBe('');
            expect(container.firstChild.lastChild.value).toBe('filled');
        });

        it('should remove for falsey boolean properties', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<div allowFullScreen={false} />, container);
            expect(container.firstChild.hasAttribute('allowFullScreen')).toBe(false);
        });

        it('should remove when setting custom attr to null', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<div data-foo="bar" />, container);
            expect(container.firstChild.hasAttribute('data-foo')).toBe(true);
            cocoMvc.renderIntoContainer(<div data-foo={null} />, container);
            expect(container.firstChild.hasAttribute('data-foo')).toBe(false);
        });

        it('should set className to empty string instead of null', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<div className="selected" />, container);
            expect(container.firstChild.className).toBe('selected');
            cocoMvc.renderIntoContainer(<div className={null} />, container);
            // className should be '', not 'null' or null (which becomes 'null' in
            // some browsers)
            expect(container.firstChild.className).toBe('');
            expect(container.firstChild.getAttribute('class')).toBe(null);
        });

        it('should remove property properly for boolean properties', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<div hidden={true} />, container);
            expect(container.firstChild.hasAttribute('hidden')).toBe(true);
            cocoMvc.renderIntoContainer(<div hidden={false} />, container);
            expect(container.firstChild.hasAttribute('hidden')).toBe(false);
        });

        it('should always assign the value attribute for non-inputs', function () {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<progress />, container);
            jest.spyOn(container.firstChild, 'setAttribute');
            cocoMvc.renderIntoContainer(<progress value={30} />, container);
            cocoMvc.renderIntoContainer(<progress value="30" />, container);
            expect(container.firstChild.setAttribute).toHaveBeenCalledTimes(2);
        });

        it('should return the progress to intermediate state on null value', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<progress value={30} />, container);
            cocoMvc.renderIntoContainer(<progress value={null} />, container);
            // Ensure we move progress back to an indeterminate state.
            // Regression test for https://github.com/facebook/react/issues/6119
            expect(container.firstChild.hasAttribute('value')).toBe(false);
        });

        it('custom elements shouldnt have non-functions for on* attributes treated as event listeners', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(
                <my-custom-element
                    onstring={'hello'}
                    onobj={{ hello: 'world' }}
                    onarray={['one', 'two']}
                    ontrue={true}
                    onfalse={false}
                />,
                container
            );
            const customElement = container.querySelector('my-custom-element');
            expect(customElement.getAttribute('onstring')).toBe('hello');
            expect(customElement.getAttribute('onobj')).toBe('[object Object]');
            expect(customElement.getAttribute('onarray')).toBe('one,two');
            expect(customElement.getAttribute('ontrue')).toBe('true');
            expect(customElement.getAttribute('onfalse')).toBe('false');

            // Dispatch the corresponding event names to make sure that nothing crashes.
            customElement.dispatchEvent(new Event('string'));
            customElement.dispatchEvent(new Event('obj'));
            customElement.dispatchEvent(new Event('array'));
            customElement.dispatchEvent(new Event('true'));
            customElement.dispatchEvent(new Event('false'));
        });

        it('custom elements should still have onClick treated like regular elements', () => {
            let syntheticClickEvent = null;
            const syntheticEventHandler = jest.fn((event) => (syntheticClickEvent = event));
            let nativeClickEvent = null;
            const nativeEventHandler = jest.fn((event) => (nativeClickEvent = event));

            const container = document.createElement('div');
            document.body.appendChild(container);
            cocoMvc.renderIntoContainer(<my-custom-element onClick={syntheticEventHandler} />, container);

            const customElement = container.querySelector('my-custom-element');
            customElement.onclick = nativeEventHandler;
            container.querySelector('my-custom-element').click();

            expect(nativeEventHandler).toHaveBeenCalledTimes(1);
            expect(syntheticEventHandler).toHaveBeenCalledTimes(1);
            expect(syntheticClickEvent.nativeEvent).toBe(nativeClickEvent);
        });

        it('custom elements should have working onInput event listeners', () => {
            let reactInputEvent = null;
            const eventHandler = jest.fn((event) => (reactInputEvent = event));
            const container = document.createElement('div');
            document.body.appendChild(container);
            cocoMvc.renderIntoContainer(<my-custom-element onInput={eventHandler} />, container);
            const customElement = container.querySelector('my-custom-element');
            let expectedHandlerCallCount = 0;

            const inputEvent = new Event('input', { bubbles: true });
            customElement.dispatchEvent(inputEvent);
            expectedHandlerCallCount++;
            expect(eventHandler).toHaveBeenCalledTimes(expectedHandlerCallCount);
            expect(reactInputEvent.nativeEvent).toBe(inputEvent);

            // Also make sure that removing and re-adding the event listener works
            cocoMvc.renderIntoContainer(<my-custom-element />, container);
            customElement.dispatchEvent(new Event('input', { bubbles: true }));
            expect(eventHandler).toHaveBeenCalledTimes(expectedHandlerCallCount);
            cocoMvc.renderIntoContainer(<my-custom-element onInput={eventHandler} />, container);
            customElement.dispatchEvent(new Event('input', { bubbles: true }));
            expectedHandlerCallCount++;
            expect(eventHandler).toHaveBeenCalledTimes(expectedHandlerCallCount);
        });

        it('<input is=...> should have the same onChange/onInput/onClick behavior as <input>', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const regularOnInputHandler = jest.fn();
            const regularOnChangeHandler = jest.fn();
            const regularOnClickHandler = jest.fn();
            const customOnInputHandler = jest.fn();
            const customOnChangeHandler = jest.fn();
            const customOnClickHandler = jest.fn();
            function clearMocks() {
                regularOnInputHandler.mockClear();
                regularOnChangeHandler.mockClear();
                regularOnClickHandler.mockClear();
                customOnInputHandler.mockClear();
                customOnChangeHandler.mockClear();
                customOnClickHandler.mockClear();
            }
            cocoMvc.renderIntoContainer(
                <div>
                    <input
                        onInput={regularOnInputHandler}
                        onChange={regularOnChangeHandler}
                        onClick={regularOnClickHandler}
                    />
                    <input
                        is="my-custom-element"
                        onInput={customOnInputHandler}
                        onChange={customOnChangeHandler}
                        onClick={customOnClickHandler}
                    />
                </div>,
                container
            );

            const regularInput = container.querySelector('input:not([is=my-custom-element])');
            const customInput = container.querySelector('input[is=my-custom-element]');
            expect(regularInput).not.toBe(customInput);

            // Typing should trigger onInput and onChange for both kinds of inputs.
            clearMocks();
            setUntrackedValue.call(regularInput, 'hello');
            regularInput.dispatchEvent(new Event('input', { bubbles: true }));
            expect(regularOnInputHandler).toHaveBeenCalledTimes(1);
            expect(regularOnChangeHandler).toHaveBeenCalledTimes(1);
            expect(regularOnClickHandler).toHaveBeenCalledTimes(0);
            setUntrackedValue.call(customInput, 'hello');
            customInput.dispatchEvent(new Event('input', { bubbles: true }));
            expect(customOnInputHandler).toHaveBeenCalledTimes(1);
            expect(customOnChangeHandler).toHaveBeenCalledTimes(1);
            expect(customOnClickHandler).toHaveBeenCalledTimes(0);

            // The native change event itself does not produce extra React events.
            clearMocks();
            regularInput.dispatchEvent(new Event('change', { bubbles: true }));
            expect(regularOnInputHandler).toHaveBeenCalledTimes(0);
            expect(regularOnChangeHandler).toHaveBeenCalledTimes(0);
            expect(regularOnClickHandler).toHaveBeenCalledTimes(0);
            customInput.dispatchEvent(new Event('change', { bubbles: true }));
            expect(customOnInputHandler).toHaveBeenCalledTimes(0);
            expect(customOnChangeHandler).toHaveBeenCalledTimes(0);
            expect(customOnClickHandler).toHaveBeenCalledTimes(0);

            // The click event is handled by both inputs.
            clearMocks();
            regularInput.dispatchEvent(new Event('click', { bubbles: true }));
            expect(regularOnInputHandler).toHaveBeenCalledTimes(0);
            expect(regularOnChangeHandler).toHaveBeenCalledTimes(0);
            expect(regularOnClickHandler).toHaveBeenCalledTimes(1);
            customInput.dispatchEvent(new Event('click', { bubbles: true }));
            expect(customOnInputHandler).toHaveBeenCalledTimes(0);
            expect(customOnChangeHandler).toHaveBeenCalledTimes(0);
            expect(customOnClickHandler).toHaveBeenCalledTimes(1);

            // Typing again should trigger onInput and onChange for both kinds of inputs.
            clearMocks();
            setUntrackedValue.call(regularInput, 'goodbye');
            regularInput.dispatchEvent(new Event('input', { bubbles: true }));
            expect(regularOnInputHandler).toHaveBeenCalledTimes(1);
            expect(regularOnChangeHandler).toHaveBeenCalledTimes(1);
            expect(regularOnClickHandler).toHaveBeenCalledTimes(0);
            setUntrackedValue.call(customInput, 'goodbye');
            customInput.dispatchEvent(new Event('input', { bubbles: true }));
            expect(customOnInputHandler).toHaveBeenCalledTimes(1);
            expect(customOnChangeHandler).toHaveBeenCalledTimes(1);
            expect(customOnClickHandler).toHaveBeenCalledTimes(0);
        });

        it('<input type=radio is=...> should have the same onChange/onInput/onClick behavior as <input type=radio>', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const regularOnInputHandler = jest.fn();
            const regularOnChangeHandler = jest.fn();
            const regularOnClickHandler = jest.fn();
            const customOnInputHandler = jest.fn();
            const customOnChangeHandler = jest.fn();
            const customOnClickHandler = jest.fn();
            function clearMocks() {
                regularOnInputHandler.mockClear();
                regularOnChangeHandler.mockClear();
                regularOnClickHandler.mockClear();
                customOnInputHandler.mockClear();
                customOnChangeHandler.mockClear();
                customOnClickHandler.mockClear();
            }
            cocoMvc.renderIntoContainer(
                <div>
                    <input
                        type="radio"
                        onInput={regularOnInputHandler}
                        onChange={regularOnChangeHandler}
                        onClick={regularOnClickHandler}
                    />
                    <input
                        is="my-custom-element"
                        type="radio"
                        onInput={customOnInputHandler}
                        onChange={customOnChangeHandler}
                        onClick={customOnClickHandler}
                    />
                </div>,
                container
            );

            const regularInput = container.querySelector('input:not([is=my-custom-element])');
            const customInput = container.querySelector('input[is=my-custom-element]');
            expect(regularInput).not.toBe(customInput);

            // Clicking should trigger onClick and onChange on both inputs.
            clearMocks();
            setUntrackedChecked.call(regularInput, true);
            regularInput.dispatchEvent(new Event('click', { bubbles: true }));
            expect(regularOnInputHandler).toHaveBeenCalledTimes(0);
            expect(regularOnChangeHandler).toHaveBeenCalledTimes(1);
            expect(regularOnClickHandler).toHaveBeenCalledTimes(1);
            setUntrackedChecked.call(customInput, true);
            customInput.dispatchEvent(new Event('click', { bubbles: true }));
            expect(customOnInputHandler).toHaveBeenCalledTimes(0);
            expect(customOnChangeHandler).toHaveBeenCalledTimes(1);
            expect(customOnClickHandler).toHaveBeenCalledTimes(1);

            // The native input event only produces a React onInput event.
            clearMocks();
            regularInput.dispatchEvent(new Event('input', { bubbles: true }));
            expect(regularOnInputHandler).toHaveBeenCalledTimes(1);
            expect(regularOnChangeHandler).toHaveBeenCalledTimes(0);
            expect(regularOnClickHandler).toHaveBeenCalledTimes(0);
            customInput.dispatchEvent(new Event('input', { bubbles: true }));
            expect(customOnInputHandler).toHaveBeenCalledTimes(1);
            expect(customOnChangeHandler).toHaveBeenCalledTimes(0);
            expect(customOnClickHandler).toHaveBeenCalledTimes(0);

            // Clicking again should trigger onClick and onChange on both inputs.
            clearMocks();
            setUntrackedChecked.call(regularInput, false);
            regularInput.dispatchEvent(new Event('click', { bubbles: true }));
            expect(regularOnInputHandler).toHaveBeenCalledTimes(0);
            expect(regularOnChangeHandler).toHaveBeenCalledTimes(1);
            expect(regularOnClickHandler).toHaveBeenCalledTimes(1);
            setUntrackedChecked.call(customInput, false);
            customInput.dispatchEvent(new Event('click', { bubbles: true }));
            expect(customOnInputHandler).toHaveBeenCalledTimes(0);
            expect(customOnChangeHandler).toHaveBeenCalledTimes(1);
            expect(customOnClickHandler).toHaveBeenCalledTimes(1);
        });

        it('<select is=...> should have the same onChange/onInput/onClick behavior as <select>', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const regularOnInputHandler = jest.fn();
            const regularOnChangeHandler = jest.fn();
            const regularOnClickHandler = jest.fn();
            const customOnInputHandler = jest.fn();
            const customOnChangeHandler = jest.fn();
            const customOnClickHandler = jest.fn();
            function clearMocks() {
                regularOnInputHandler.mockClear();
                regularOnChangeHandler.mockClear();
                regularOnClickHandler.mockClear();
                customOnInputHandler.mockClear();
                customOnChangeHandler.mockClear();
                customOnClickHandler.mockClear();
            }
            cocoMvc.renderIntoContainer(
                <div>
                    <select
                        onInput={regularOnInputHandler}
                        onChange={regularOnChangeHandler}
                        onClick={regularOnClickHandler}
                    />
                    <select
                        is="my-custom-element"
                        onInput={customOnInputHandler}
                        onChange={customOnChangeHandler}
                        onClick={customOnClickHandler}
                    />
                </div>,
                container
            );

            const regularSelect = container.querySelector('select:not([is=my-custom-element])');
            const customSelect = container.querySelector('select[is=my-custom-element]');
            expect(regularSelect).not.toBe(customSelect);

            // Clicking should only trigger onClick on both inputs.
            clearMocks();
            regularSelect.dispatchEvent(new Event('click', { bubbles: true }));
            expect(regularOnInputHandler).toHaveBeenCalledTimes(0);
            expect(regularOnChangeHandler).toHaveBeenCalledTimes(0);
            expect(regularOnClickHandler).toHaveBeenCalledTimes(1);
            customSelect.dispatchEvent(new Event('click', { bubbles: true }));
            expect(customOnInputHandler).toHaveBeenCalledTimes(0);
            expect(customOnChangeHandler).toHaveBeenCalledTimes(0);
            expect(customOnClickHandler).toHaveBeenCalledTimes(1);

            // Native input event should only trigger onInput on both inputs.
            clearMocks();
            regularSelect.dispatchEvent(new Event('input', { bubbles: true }));
            expect(regularOnInputHandler).toHaveBeenCalledTimes(1);
            expect(regularOnChangeHandler).toHaveBeenCalledTimes(0);
            expect(regularOnClickHandler).toHaveBeenCalledTimes(0);
            customSelect.dispatchEvent(new Event('input', { bubbles: true }));
            expect(customOnInputHandler).toHaveBeenCalledTimes(1);
            expect(customOnChangeHandler).toHaveBeenCalledTimes(0);
            expect(customOnClickHandler).toHaveBeenCalledTimes(0);

            // Native change event should trigger onChange.
            clearMocks();
            regularSelect.dispatchEvent(new Event('change', { bubbles: true }));
            expect(regularOnInputHandler).toHaveBeenCalledTimes(0);
            expect(regularOnChangeHandler).toHaveBeenCalledTimes(1);
            expect(regularOnClickHandler).toHaveBeenCalledTimes(0);
            customSelect.dispatchEvent(new Event('change', { bubbles: true }));
            expect(customOnInputHandler).toHaveBeenCalledTimes(0);
            expect(customOnChangeHandler).toHaveBeenCalledTimes(1);
            expect(customOnClickHandler).toHaveBeenCalledTimes(0);
        });

        it('custom element onChange/onInput/onClick with event target input child', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const onChangeHandler = jest.fn();
            const onInputHandler = jest.fn();
            const onClickHandler = jest.fn();
            cocoMvc.renderIntoContainer(
                <my-custom-element onChange={onChangeHandler} onInput={onInputHandler} onClick={onClickHandler}>
                    <input />
                </my-custom-element>,
                container
            );

            const input = container.querySelector('input');
            setUntrackedValue.call(input, 'hello');
            input.dispatchEvent(new Event('input', { bubbles: true }));
            // Simulated onChange from the child's input event
            // bubbles to the parent custom element.
            expect(onChangeHandler).toBeCalledTimes(1);
            expect(onInputHandler).toBeCalledTimes(1);
            expect(onClickHandler).toBeCalledTimes(0);
            // Consequently, the native change event is ignored.
            input.dispatchEvent(new Event('change', { bubbles: true }));
            expect(onChangeHandler).toBeCalledTimes(1);
            expect(onInputHandler).toBeCalledTimes(1);
            expect(onClickHandler).toBeCalledTimes(0);
            input.dispatchEvent(new Event('click', { bubbles: true }));
            expect(onChangeHandler).toBeCalledTimes(1);
            expect(onInputHandler).toBeCalledTimes(1);
            expect(onClickHandler).toBeCalledTimes(1);
        });

        it('custom element onChange/onInput/onClick with event target div child', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const onChangeHandler = jest.fn();
            const onInputHandler = jest.fn();
            const onClickHandler = jest.fn();
            cocoMvc.renderIntoContainer(
                <my-custom-element onChange={onChangeHandler} onInput={onInputHandler} onClick={onClickHandler}>
                    <div />
                </my-custom-element>,
                container
            );

            const div = container.querySelector('div');
            div.dispatchEvent(new Event('input', { bubbles: true }));
            expect(onChangeHandler).toBeCalledTimes(0);
            expect(onInputHandler).toBeCalledTimes(1);
            expect(onClickHandler).toBeCalledTimes(0);

            div.dispatchEvent(new Event('change', { bubbles: true }));
            // React always ignores change event invoked on non-custom and non-input targets.
            // So change event emitted on a div does not propagate upwards.
            expect(onChangeHandler).toBeCalledTimes(0);
            expect(onInputHandler).toBeCalledTimes(1);
            expect(onClickHandler).toBeCalledTimes(0);

            div.dispatchEvent(new Event('click', { bubbles: true }));
            expect(onChangeHandler).toBeCalledTimes(0);
            expect(onInputHandler).toBeCalledTimes(1);
            expect(onClickHandler).toBeCalledTimes(1);
        });

        it('div onChange/onInput/onClick with event target div child', () => {
            const container = document.createElement('div');
            document.body.appendChild(container);
            const onChangeHandler = jest.fn();
            const onInputHandler = jest.fn();
            const onClickHandler = jest.fn();
            cocoMvc.renderIntoContainer(
                <div onChange={onChangeHandler} onInput={onInputHandler} onClick={onClickHandler}>
                    <div />
                </div>,
                container
            );

            const div = container.querySelector('div > div');
            div.dispatchEvent(new Event('input', { bubbles: true }));
            expect(onChangeHandler).toBeCalledTimes(0);
            expect(onInputHandler).toBeCalledTimes(1);
            expect(onClickHandler).toBeCalledTimes(0);

            div.dispatchEvent(new Event('change', { bubbles: true }));
            // React always ignores change event invoked on non-custom and non-input targets.
            // So change event emitted on a div does not propagate upwards.
            expect(onChangeHandler).toBeCalledTimes(0);
            expect(onInputHandler).toBeCalledTimes(1);
            expect(onClickHandler).toBeCalledTimes(0);

            div.dispatchEvent(new Event('click', { bubbles: true }));
            expect(onChangeHandler).toBeCalledTimes(0);
            expect(onInputHandler).toBeCalledTimes(1);
            expect(onClickHandler).toBeCalledTimes(1);
        });

        it('innerHTML should not work on custom elements', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<my-custom-element innerHTML="foo" />, container);
            const customElement = container.querySelector('my-custom-element');
            expect(customElement.getAttribute('innerHTML')).toBe(null);
            expect(customElement.hasChildNodes()).toBe(false);

            // Render again to verify the update codepath doesn't accidentally let
            // something through.
            cocoMvc.renderIntoContainer(<my-custom-element innerHTML="bar" />, container);
            expect(customElement.getAttribute('innerHTML')).toBe(null);
            expect(customElement.hasChildNodes()).toBe(false);
        });
    });

    describe('deleteValueForProperty', () => {
        it('should remove attributes for normal properties', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<div title="foo" />, container);
            expect(container.firstChild.getAttribute('title')).toBe('foo');
            cocoMvc.renderIntoContainer(<div />, container);
            expect(container.firstChild.getAttribute('title')).toBe(null);
        });

        it('should not remove attributes for special properties', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<input type="text" value="foo" onChange={function () {}} />, container);
            expect(container.firstChild.getAttribute('value')).toBe('foo');
            expect(container.firstChild.value).toBe('foo');
            cocoMvc.renderIntoContainer(<input type="text" onChange={function () {}} />, container);
            expect(consoleErrorSpy).toHaveBeenCalledWith(
                'A component is changing a controlled input to be uncontrolled. ' +
                    'This is likely caused by the value changing from a defined to ' +
                    'undefined, which should not happen. ' +
                    'Decide between using a controlled or uncontrolled input ' +
                    'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components'
            );
            expect(container.firstChild.getAttribute('value')).toBe('foo');
            expect(container.firstChild.value).toBe('foo');
        });

        it('should not remove attributes for custom component tag', () => {
            const container = document.createElement('div');
            cocoMvc.renderIntoContainer(<my-icon size="5px" />, container);
            expect(container.firstChild.getAttribute('size')).toBe('5px');
        });
    });
});
