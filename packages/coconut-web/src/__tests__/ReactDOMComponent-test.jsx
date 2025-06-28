/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 *
 * packages/react-dom/src/__tests__/ReactDOMComponent-test.js
 */
'use strict';

import { render, unmountComponentAtNode, registerApplication, unregisterApplication, cleanCache } from '../index';
import * as ReactTestUtils from './test-units/ReactTestUnits';

let Application
let application
let jsx
let view
let consoleSpy
describe('ReactDOMComponent', () => {
  beforeEach(async () => {
    Application = (await import('coco-mvc')).Application;
    view = (await import('coco-mvc')).view
    jsx = (await import('coco-mvc/jsx-runtime')).jsx;
    application = new Application();
    registerApplication(application);
    consoleSpy = jest.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {})
  })

  afterEach(() => {
    cleanCache();
    unregisterApplication();
    jest.resetModules();
    consoleSpy.mockRestore();
  })

  describe('updateDOM', () => {
    it('should handle className', () => {
      const container = document.createElement('div');
      render(<div style={{}} />, container);

      render(<div className={'foo'} />, container);
      expect(container.firstChild.className).toEqual('foo');
      render(<div className={'bar'} />, container);
      expect(container.firstChild.className).toEqual('bar');
      render(<div className={null} />, container);
      expect(container.firstChild.className).toEqual('');
    });

    it('should gracefully handle various style value types', () => {
      const container = document.createElement('div');
      render(<div style={{}} />, container);
      const stubStyle = container.firstChild.style;

      // set initial style
      const setup = {
        display: 'block',
        left: '1px',
        top: 2,
        fontFamily: 'Arial',
      };
      render(<div style={setup} />, container);
      expect(stubStyle.display).toEqual('block');
      expect(stubStyle.left).toEqual('1px');
      expect(stubStyle.top).toEqual('2px');
      expect(stubStyle.fontFamily).toEqual('Arial');

      // reset the style to their default state
      const reset = {display: '', left: null, top: false, fontFamily: true};
      render(<div style={reset} />, container);
      expect(stubStyle.display).toEqual('');
      expect(stubStyle.left).toEqual('');
      expect(stubStyle.top).toEqual('');
      expect(stubStyle.fontFamily).toEqual('');
    });

    it('should not update styles when mutating a proxy style object', () => {
      const styleStore = {
        display: 'none',
        fontFamily: 'Arial',
        lineHeight: 1.2,
      };
      // We use a proxy style object so that we can mutate it even if it is
      // frozen in DEV.
      const styles = {
        get display() {
          return styleStore.display;
        },
        set display(v) {
          styleStore.display = v;
        },
        get fontFamily() {
          return styleStore.fontFamily;
        },
        set fontFamily(v) {
          styleStore.fontFamily = v;
        },
        get lineHeight() {
          return styleStore.lineHeight;
        },
        set lineHeight(v) {
          styleStore.lineHeight = v;
        },
      };
      const container = document.createElement('div');
      render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;
      stubStyle.display = styles.display;
      stubStyle.fontFamily = styles.fontFamily;

      styles.display = 'block';

      render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('none');
      expect(stubStyle.fontFamily).toEqual('Arial');
      expect(stubStyle.lineHeight).toEqual('1.2');

      styles.fontFamily = 'Helvetica';

      render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('none');
      expect(stubStyle.fontFamily).toEqual('Arial');
      expect(stubStyle.lineHeight).toEqual('1.2');

      styles.lineHeight = 0.5;

      render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('none');
      expect(stubStyle.fontFamily).toEqual('Arial');
      expect(stubStyle.lineHeight).toEqual('1.2');

      render(<div style={undefined} />, container);
      expect(stubStyle.display).toBe('');
      expect(stubStyle.fontFamily).toBe('');
      expect(stubStyle.lineHeight).toBe('');
    });

    it('should throw when mutating style objects', () => {
      const style = {border: '1px solid black'};

      @view()
      class App {
        state = {style: style};

        render() {
          return <div style={this.state.style}>asd</div>;
        }
      }

      application.start();
      ReactTestUtils.renderIntoDocument(<App />);
      if (__DEV__) {
        expect(() => (style.position = 'absolute')).toThrow()
      }
    });

    it('should warn for unknown prop', () => {
      const container = document.createElement('div');
      render(<div foo={() => {}} />, container)
      expect(consoleSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`foo`',
        'div',
      );
    });

    it('should group multiple unknown prop warnings together', () => {
      const container = document.createElement('div');
      render(<div foo={() => {}} baz={() => {}} />, container);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid values for props %s on <%s> tag. Either remove them from the element, or pass a string or number value to keep them in the DOM. For details, see https://reactjs.org/link/attribute-behavior ',
        '`foo`, `baz`',
        'div',
      );
    });

    it('should warn for onDblClick prop', () => {
      const container = document.createElement('div');
      render(<div onDblClick={() => {}} />, container);
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid event handler property `%s`. Did you mean `%s`?',
        'onDblClick',
        'onDoubleClick'
      );
    });

    it('should warn for unknown string event handlers', () => {
      const container = document.createElement('div');
      render(<div onUnknown='alert("hack")' />, container);
      expect(consoleSpy.mock.calls[0]).toEqual([
        'Unknown event handler property `%s`. It will be ignored.',
        'onUnknown'
        ]
      );
      expect(container.firstChild.hasAttribute('onUnknown')).toBe(false);
      expect(container.firstChild.onUnknown).toBe(undefined);
      render(<div onunknown={function() {}} />, container);
      expect(consoleSpy.mock.calls[1]).toEqual(['Unknown event handler property `%s`. It will be ignored.', 'onunknown']);
      expect(container.firstChild.hasAttribute('onunknown')).toBe(false);
      expect(container.firstChild.onunknown).toBe(undefined);
      render(<div on-unknown={function() {}} />, container);
      expect(consoleSpy.mock.calls[2]).toEqual(['Unknown event handler property `%s`. It will be ignored.','on-unknown']);
      expect(container.firstChild.hasAttribute('on-unknown')).toBe(false);
      expect(container.firstChild['on-unknown']).toBe(undefined);
    })

    it('should warn for badly cased React attributes', () => {
      const container = document.createElement('div');
      render(<div CHILDREN="5" />, container)
      expect(consoleSpy).toHaveBeenCalledWith(
        'Invalid DOM property `%s`. Did you mean `%s`?',
        'CHILDREN',
        'children',
      );
      expect(container.firstChild.getAttribute('CHILDREN')).toBe('5');
    });

    it('should not warn for "0" as a unitless style value', () => {
      @view()
      class Component {
        render() {
          return <div style={{margin: '0'}} />;
        }
      }
      application.start()
      ReactTestUtils.renderIntoDocument(<Component />);
    });

    it('should warn nicely about NaN in style', () => {
      const style = {fontSize: NaN};
      const div = document.createElement('div');
      render(<span style={style} />, div);
      expect(consoleSpy).toHaveBeenCalledWith(
        '`NaN` is an invalid value for the `%s` css style property.',
        'fontSize',
      );
      render(<span style={style} />, div);
    });

    it('throws with Temporal-like objects as style values', () => {
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
      const style = {fontSize: new TemporalLike()};
      const div = document.createElement('div');
      const test = () => render(<span style={style} />, div);
      expect(test).toThrow();
      expect(consoleSpy).toHaveBeenCalledWith(
        'The provided `%s` CSS property is an unsupported type %s. This value must be coerced to a string before before using it here.',
        `fontSize`,
        'TemporalLike',
      );
    });

    it('should update styles if initially null', () => {
      let styles = null;
      const container = document.createElement('div');
      render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;

      styles = {display: 'block'};

      render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('block');
    });

    it('should update styles if updated to null multiple times', () => {
      let styles = null;
      const container = document.createElement('div');
      render(<div style={styles} />, container);

      styles = {display: 'block'};
      const stubStyle = container.firstChild.style;

      render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('block');

      render(<div style={null} />, container);
      expect(stubStyle.display).toEqual('');

      render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('block');

      render(<div style={null} />, container);
      expect(stubStyle.display).toEqual('');
    });

    it('should render null and undefined as empty but print other falsy values', () => {
      const container = document.createElement('div');

      render(
        <div dangerouslySetInnerHTML={{__html: 'textContent'}} />,
        container,
      );
      expect(container.textContent).toEqual('textContent');

      render(<div dangerouslySetInnerHTML={{__html: 0}} />, container);
      expect(container.textContent).toEqual('0');

      render(
        <div dangerouslySetInnerHTML={{__html: false}} />,
        container,
      );
      expect(container.textContent).toEqual('false');

      render(
        <div dangerouslySetInnerHTML={{__html: ''}} />,
        container,
      );
      expect(container.textContent).toEqual('');

      render(
        <div dangerouslySetInnerHTML={{__html: null}} />,
        container,
      );
      expect(container.textContent).toEqual('');

      render(
        <div dangerouslySetInnerHTML={{__html: undefined}} />,
        container,
      );
      expect(container.textContent).toEqual('');
    });

    it('should remove attributes', () => {
      const container = document.createElement('div');
      render(<img height="17" />, container);

      expect(container.firstChild.hasAttribute('height')).toBe(true);
      render(<img />, container);
      expect(container.firstChild.hasAttribute('height')).toBe(false);
    });

    it('should remove properties', () => {
      const container = document.createElement('div');
      render(<div className="monkey" />, container);

      expect(container.firstChild.className).toEqual('monkey');
      render(<div />, container);
      expect(container.firstChild.className).toEqual('');
    });

    it('should not set null/undefined attributes', () => {
      const container = document.createElement('div');
      // Initial render.
      render(<img src={null} data-foo={undefined} />, container);
      const node = container.firstChild;
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
      // Update in one direction.
      render(<img src={undefined} data-foo={null} />, container);
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
      // Update in another direction.
      render(<img src={null} data-foo={undefined} />, container);
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
      // Removal.
      render(<img />, container);
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
      // Addition.
      render(<img src={undefined} data-foo={null} />, container);
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
    })

    it('should apply React-specific aliases to HTML elements', () => {
      const container = document.createElement('div');
      render(<form acceptCharset="foo" />, container);
      const node = container.firstChild;
      // Test attribute initialization.
      expect(node.getAttribute('accept-charset')).toBe('foo');
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Test attribute update.
      render(<form acceptCharset="boo" />, container);
      expect(node.getAttribute('accept-charset')).toBe('boo');
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Test attribute removal by setting to null.
      render(<form acceptCharset={null} />, container);
      expect(node.hasAttribute('accept-charset')).toBe(false);
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Restore.
      render(<form acceptCharset="foo" />, container);
      expect(node.getAttribute('accept-charset')).toBe('foo');
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Test attribute removal by setting to undefined.
      render(<form acceptCharset={undefined} />, container);
      expect(node.hasAttribute('accept-charset')).toBe(false);
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Restore.
      render(<form acceptCharset="foo" />, container);
      expect(node.getAttribute('accept-charset')).toBe('foo');
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Test attribute removal.
      render(<form />, container);
      expect(node.hasAttribute('accept-charset')).toBe(false);
      expect(node.hasAttribute('acceptCharset')).toBe(false);
    });

    it('should apply React-specific aliases to SVG elements', () => {
      const container = document.createElement('div');
      render(<svg arabicForm="foo" />, container);
      const node = container.firstChild;
      // Test attribute initialization.
      expect(node.getAttribute('arabic-form')).toBe('foo');
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Test attribute update.
      render(<svg arabicForm="boo" />, container);
      expect(node.getAttribute('arabic-form')).toBe('boo');
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Test attribute removal by setting to null.
      render(<svg arabicForm={null} />, container);
      expect(node.hasAttribute('arabic-form')).toBe(false);
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Restore.
      render(<svg arabicForm="foo" />, container);
      expect(node.getAttribute('arabic-form')).toBe('foo');
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Test attribute removal by setting to undefined.
      render(<svg arabicForm={undefined} />, container);
      expect(node.hasAttribute('arabic-form')).toBe(false);
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Restore.
      render(<svg arabicForm="foo" />, container);
      expect(node.getAttribute('arabic-form')).toBe('foo');
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Test attribute removal.
      render(<svg />, container);
      expect(node.hasAttribute('arabic-form')).toBe(false);
      expect(node.hasAttribute('arabicForm')).toBe(false);
    });

    it('should properly update custom attributes on custom elements', () => {
      const container = document.createElement('div');
      render(<some-custom-element foo="bar" />, container);
      render(<some-custom-element bar="buzz" />, container);
      const node = container.firstChild;
      expect(node.hasAttribute('foo')).toBe(false);
      expect(node.getAttribute('bar')).toBe('buzz');
    });

    it('should not apply React-specific aliases to custom elements', () => {
      const container = document.createElement('div');
      render(<some-custom-element arabicForm="foo" />, container);
      const node = container.firstChild;
      // Should not get transformed to arabic-form as SVG would be.
      expect(node.getAttribute('arabicForm')).toBe('foo');
      expect(node.hasAttribute('arabic-form')).toBe(false);
      // Test attribute update.
      render(<some-custom-element arabicForm="boo" />, container);
      expect(node.getAttribute('arabicForm')).toBe('boo');
      // Test attribute removal and addition.
      render(<some-custom-element acceptCharset="buzz" />, container);
      // Verify the previous attribute was removed.
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Should not get transformed to accept-charset as HTML would be.
      expect(node.getAttribute('acceptCharset')).toBe('buzz');
      expect(node.hasAttribute('accept-charset')).toBe(false);
    });

    it('should clear a single style prop when changing `style`', () => {
      let styles = {display: 'none', color: 'red'};
      const container = document.createElement('div');
      render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;

      styles = {color: 'green'};
      render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('');
      expect(stubStyle.color).toEqual('green');
    });

    it('should reject attribute key injection attack on mount for regular DOM', () => {
      for (let i = 0; i < 3; i++) {
        const container = document.createElement('div');
        render(
          jsx(
            'div',
            {'blah" onclick="beevil" noise="hi': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
        unmountComponentAtNode(container);
        render(
          jsx(
            'div',
            {'></div><script>alert("hi")</script>': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
      }
      expect(consoleSpy.mock.calls[0]).toEqual([
        'Invalid attribute name: `%s`',
        'blah" onclick="beevil" noise="hi',
      ]);
      expect(consoleSpy.mock.calls[1]).toEqual([
        'Invalid attribute name: `%s`',
        '></div><script>alert("hi")</script>',
      ]);
    });

    it('should reject attribute key injection attack on mount for custom elements', () => {
      for (let i = 0; i < 3; i++) {
        const container = document.createElement('div');
        render(
          jsx(
            'x-foo-component',
            {'blah" onclick="beevil" noise="hi': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
        unmountComponentAtNode(container);
        render(
          jsx(
            'x-foo-component',
            {'></x-foo-component><script>alert("hi")</script>': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
      }
      expect(consoleSpy.mock.calls[0]).toEqual([
        'Invalid attribute name: `%s`',
        'blah" onclick="beevil" noise="hi',
      ]);
      expect(consoleSpy.mock.calls[1]).toEqual([
        'Invalid attribute name: `%s`',
        '></x-foo-component><script>alert("hi")</script>',
      ]);
    });

    it('should reject attribute key injection attack on update for regular DOM', () => {
      for (let i = 0; i < 3; i++) {
        const container = document.createElement('div');
        const beforeUpdate = jsx('div', {}, null);
        render(beforeUpdate, container);
        render(
          jsx(
            'div',
            {'blah" onclick="beevil" noise="hi': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
        render(
          jsx(
            'div',
            {'></div><script>alert("hi")</script>': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
      }
      expect(consoleSpy.mock.calls[0]).toEqual([
        'Invalid attribute name: `%s`',
        'blah" onclick="beevil" noise="hi',
      ]);
      expect(consoleSpy.mock.calls[1]).toEqual([
        'Invalid attribute name: `%s`',
        '></div><script>alert("hi")</script>',
      ]);
    });

    it('should reject attribute key injection attack on update for custom elements', () => {
      for (let i = 0; i < 3; i++) {
        const container = document.createElement('div');
        const beforeUpdate = jsx('x-foo-component', {}, null);
        render(beforeUpdate, container);
        render(
          jsx(
            'x-foo-component',
            {'blah" onclick="beevil" noise="hi': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
        render(
          jsx(
            'x-foo-component',
            {'></x-foo-component><script>alert("hi")</script>': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
      }
      expect(consoleSpy.mock.calls[0]).toEqual([
        'Invalid attribute name: `%s`',
        'blah" onclick="beevil" noise="hi',
      ]);
      expect(consoleSpy.mock.calls[1]).toEqual([
        'Invalid attribute name: `%s`',
        '></x-foo-component><script>alert("hi")</script>',
      ]);
    });

    it('should update arbitrary attributes for tags containing dashes', () => {
      const container = document.createElement('div');

      const beforeUpdate = jsx('x-foo-component', {}, null);
      render(beforeUpdate, container);

      const afterUpdate = <x-foo-component myattr="myval" />;
      render(afterUpdate, container);

      expect(container.childNodes[0].getAttribute('myattr')).toBe('myval');
    });

    it('should clear all the styles when removing `style`', () => {
      const styles = {display: 'none', color: 'red'};
      const container = document.createElement('div');
      render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;

      render(<div />, container);
      expect(stubStyle.display).toEqual('');
      expect(stubStyle.color).toEqual('');
    });

    it('should update styles when `style` changes from null to object', () => {
      const container = document.createElement('div');
      const styles = {color: 'red'};
      render(<div style={styles} />, container);
      render(<div />, container);
      render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;
      expect(stubStyle.color).toEqual('red');
    });

    it('should not reset innerHTML for when children is null', () => {
      const container = document.createElement('div');
      render(<div />, container);
      container.firstChild.innerHTML = 'bonjour';
      expect(container.firstChild.innerHTML).toEqual('bonjour');

      render(<div />, container);
      expect(container.firstChild.innerHTML).toEqual('bonjour');
    });

    it('should reset innerHTML when switching from a direct text child to an empty child', () => {
      const transitionToValues = [null, undefined, false];
      transitionToValues.forEach(transitionToValue => {
        const container = document.createElement('div');
        render(<div>bonjour</div>, container);
        expect(container.firstChild.innerHTML).toEqual('bonjour');

        render(<div>{null}</div>, container);
        expect(container.firstChild.innerHTML).toEqual('');
      });
    });

    it('should empty element when removing innerHTML', () => {
      const container = document.createElement('div');
      render(
        <div dangerouslySetInnerHTML={{__html: ':)'}} />,
        container,
      );

      expect(container.firstChild.innerHTML).toEqual(':)');
      render(<div />, container);
      expect(container.firstChild.innerHTML).toEqual('');
    });

    it('should transition from string content to innerHTML', () => {
      const container = document.createElement('div');
      render(<div>hello</div>, container);

      expect(container.firstChild.innerHTML).toEqual('hello');
      render(
        <div dangerouslySetInnerHTML={{__html: 'goodbye'}} />,
        container,
      );
      expect(container.firstChild.innerHTML).toEqual('goodbye');
    });

    it('should transition from innerHTML to string content', () => {
      const container = document.createElement('div');
      render(
        <div dangerouslySetInnerHTML={{__html: 'bonjour'}} />,
        container,
      );

      expect(container.firstChild.innerHTML).toEqual('bonjour');
      render(<div>adieu</div>, container);
      expect(container.firstChild.innerHTML).toEqual('adieu');
    });

    it('should transition from innerHTML to children in nested el', () => {
      const container = document.createElement('div');
      render(
        <div>
          <div dangerouslySetInnerHTML={{__html: 'bonjour'}} />
        </div>,
        container,
      );

      expect(container.textContent).toEqual('bonjour');
      render(
        <div>
          <div>
            <span>adieu</span>
          </div>
        </div>,
        container,
      );
      expect(container.textContent).toEqual('adieu');
    });

    it('should transition from children to innerHTML in nested el', () => {
      const container = document.createElement('div');
      render(
        <div>
          <div>
            <span>adieu</span>
          </div>
        </div>,
        container,
      );

      expect(container.textContent).toEqual('adieu');
      render(
        <div>
          <div dangerouslySetInnerHTML={{__html: 'bonjour'}} />
        </div>,
        container,
      );
      expect(container.textContent).toEqual('bonjour');
    });

    it('should not incur unnecessary DOM mutations for attributes', () => {
      const container = document.createElement('div');
      render(<div id="" />, container);

      const node = container.firstChild;
      const nodeSetAttribute = node.setAttribute;
      node.setAttribute = jest.fn();
      node.setAttribute.mockImplementation(nodeSetAttribute);

      const nodeRemoveAttribute = node.removeAttribute;
      node.removeAttribute = jest.fn();
      node.removeAttribute.mockImplementation(nodeRemoveAttribute);

      render(<div id="" />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(0);
      expect(node.removeAttribute).toHaveBeenCalledTimes(0);

      render(<div id="foo" />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(1);
      expect(node.removeAttribute).toHaveBeenCalledTimes(0);

      render(<div id="foo" />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(1);
      expect(node.removeAttribute).toHaveBeenCalledTimes(0);

      render(<div />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(1);
      expect(node.removeAttribute).toHaveBeenCalledTimes(1);

      render(<div id="" />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(2);
      expect(node.removeAttribute).toHaveBeenCalledTimes(1);

      render(<div />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(2);
      expect(node.removeAttribute).toHaveBeenCalledTimes(2);
    });

    it('should not incur unnecessary DOM mutations for string properties', () => {
      const container = document.createElement('div');
      render(<div value="" />, container);

      const node = container.firstChild;

      const nodeValueSetter = jest.fn();

      const oldSetAttribute = node.setAttribute.bind(node);
      node.setAttribute = function(key, value) {
        oldSetAttribute(key, value);
        nodeValueSetter(key, value);
      };

      render(<div value="foo" />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      render(<div value="foo" />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      render(<div />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      render(<div value={null} />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      render(<div value="" />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(2);

      render(<div />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(2);
    });

    it('should not incur unnecessary DOM mutations for boolean properties', () => {
      const container = document.createElement('div');
      render(<div checked={true} />, container);

      const node = container.firstChild;
      let nodeValue = true;
      const nodeValueSetter = jest.fn();
      Object.defineProperty(node, 'checked', {
        get: function() {
          return nodeValue;
        },
        set: nodeValueSetter.mockImplementation(function(newValue) {
          nodeValue = newValue;
        }),
      });

      render(<div checked={true} />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(0);

      render(<div />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      render(<div checked={false} />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(2);

      render(<div checked={true} />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(3);
    });

    it('should not update when switching between null/undefined', () => {
      const container = document.createElement('div');
      const node = render(<div />, container);

      const setter = jest.fn();
      node.setAttribute = setter;

      render(<div dir={null} />, container);
      render(<div dir={undefined} />, container);
      render(<div />, container);
      expect(setter).toHaveBeenCalledTimes(0);
      render(<div dir="ltr" />, container);
      expect(setter).toHaveBeenCalledTimes(1);
    });

    it('handles multiple child updates without interference', () => {
      // This test might look like it's just testing ReactMultiChild but the
      // last bug in this was actually in DOMChildrenOperations so this test
      // needs to be in some DOM-specific test file.
      const container = document.createElement('div');

      // ABCD
      render(
        <div>
          <div key="one">
            <div key="A">A</div>
            <div key="B">B</div>
          </div>
          <div key="two">
            <div key="C">C</div>
            <div key="D">D</div>
          </div>
        </div>,
        container,
      );
      // BADC
      render(
        <div>
          <div key="one">
            <div key="B">B</div>
            <div key="A">A</div>
          </div>
          <div key="two">
            <div key="D">D</div>
            <div key="C">C</div>
          </div>
        </div>,
        container,
      );

      expect(container.textContent).toBe('BADC');
    });
  })

  describe('mountComponent', () => {
    let mountComponent;

    beforeEach(() => {
      mountComponent = function(props) {
        const container = document.createElement('div');
        render(<div {...props} />, container);
      };
    });

    it('should work error event on <source> element', () => {
      const container = document.createElement('div');
      render(
        <video>
          <source
            src="http://example.org/video"
            type="video/mp4"
            onError={e => console.error('onError called')}
          />
        </video>,
        container,
      );

      const errorEvent = document.createEvent('Event');
      errorEvent.initEvent('error', false, false);
      container.getElementsByTagName('source')[0].dispatchEvent(errorEvent);

      if (__DEV__) {
        expect(consoleSpy).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith('onError called');
      }
    });

    it('should warn on upper case HTML tags, not SVG nor custom tags', () => {
      ReactTestUtils.renderIntoDocument(
        jsx('svg', null, jsx('PATH')),
      );
      ReactTestUtils.renderIntoDocument(jsx('CUSTOM-TAG'));

      ReactTestUtils.renderIntoDocument(jsx('IMG'));
      expect(consoleSpy).toHaveBeenCalledWith(
        '<%s /> is using incorrect casing. ' +
        'Use PascalCase for React components, ' +
        'or lowercase for HTML elements.',
        'IMG'
      );
    });

    it('should warn on props reserved for future use', () => {
      ReactTestUtils.renderIntoDocument(<div aria="hello" />),
      expect(consoleSpy).toHaveBeenCalledWith(
        'The `aria` attribute is reserved for future use in React. ' +
        'Pass individual `aria-` attributes instead.',
      );
    });

    it('should warn if the tag is unrecognized', () => {
      let realToString;
      try {
        realToString = Object.prototype.toString;
        const wrappedToString = function() {
          // Emulate browser behavior which is missing in jsdom
          if (this instanceof window.HTMLUnknownElement) {
            return '[object HTMLUnknownElement]';
          }
          return realToString.apply(this, arguments);
        };
        Object.prototype.toString = wrappedToString; // eslint-disable-line no-extend-native
        ReactTestUtils.renderIntoDocument(<bar />);
        expect(consoleSpy.mock.calls[0]).toEqual(
          [
            "The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.",
            "bar",
          ]
        );
        // Test deduplication
        ReactTestUtils.renderIntoDocument(<foo />);
        expect(consoleSpy.mock.calls[1]).toEqual(
          [
            "The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.",
            "foo",
          ]
        );
        ReactTestUtils.renderIntoDocument(<foo />);
        ReactTestUtils.renderIntoDocument(<time />);
        // Corner case. Make sure out deduplication logic doesn't break with weird tag.
        ReactTestUtils.renderIntoDocument(<hasOwnProperty />);
        expect(consoleSpy.mock.calls[2]).toEqual([
          '<%s /> is using incorrect casing. ' +
          'Use PascalCase for React components, ' +
          'or lowercase for HTML elements.',
          'hasOwnProperty'
        ]);
        expect(consoleSpy.mock.calls[3]).toEqual([
          "The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.",
          'hasOwnProperty',
        ])
      } finally {
        Object.prototype.toString = realToString; // eslint-disable-line no-extend-native
      }
    });
  })
})