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

import * as ReactTestUtils from './test-units/ReactTestUnits';

let cocoMvc
let Application
let application
let jsx
let view
let consoleErrorSpy
let consoleLogSpy
describe('ReactDOMComponent', () => {
  beforeEach(async () => {
    cocoMvc = (await import('coco-mvc'));
    Application = (await import('coco-mvc')).Application;
    view = (await import('coco-mvc')).view
    jsx = (await import('coco-mvc/jsx-runtime')).jsx;
    application = new Application();
    cocoMvc.registerApplication(application);
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {})
    consoleLogSpy = jest.spyOn(console, 'log');
    consoleLogSpy.mockImplementation(() => {})
  })

  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  })

  describe('updateDOM', () => {
    it('should handle className', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div style={{}} />, container);

      cocoMvc.render(<div className={'foo'} />, container);
      expect(container.firstChild.className).toEqual('foo');
      cocoMvc.render(<div className={'bar'} />, container);
      expect(container.firstChild.className).toEqual('bar');
      cocoMvc.render(<div className={null} />, container);
      expect(container.firstChild.className).toEqual('');
    });

    it('should gracefully handle various style value types', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div style={{}} />, container);
      const stubStyle = container.firstChild.style;

      // set initial style
      const setup = {
        display: 'block',
        left: '1px',
        top: 2,
        fontFamily: 'Arial',
      };
      cocoMvc.render(<div style={setup} />, container);
      expect(stubStyle.display).toEqual('block');
      expect(stubStyle.left).toEqual('1px');
      expect(stubStyle.top).toEqual('2px');
      expect(stubStyle.fontFamily).toEqual('Arial');

      // reset the style to their default state
      const reset = {display: '', left: null, top: false, fontFamily: true};
      cocoMvc.render(<div style={reset} />, container);
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
      cocoMvc.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;
      stubStyle.display = styles.display;
      stubStyle.fontFamily = styles.fontFamily;

      styles.display = 'block';

      cocoMvc.render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('none');
      expect(stubStyle.fontFamily).toEqual('Arial');
      expect(stubStyle.lineHeight).toEqual('1.2');

      styles.fontFamily = 'Helvetica';

      cocoMvc.render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('none');
      expect(stubStyle.fontFamily).toEqual('Arial');
      expect(stubStyle.lineHeight).toEqual('1.2');

      styles.lineHeight = 0.5;

      cocoMvc.render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('none');
      expect(stubStyle.fontFamily).toEqual('Arial');
      expect(stubStyle.lineHeight).toEqual('1.2');

      cocoMvc.render(<div style={undefined} />, container);
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
      ReactTestUtils.renderIntoDocument(<App />, cocoMvc);
      if (__DEV__) {
        expect(() => (style.position = 'absolute')).toThrow()
      }
    });

    it('should warn for unknown prop', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div foo={() => {}} />, container)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        `Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior `,
        '`foo`',
        'div',
      );
    });

    it('should group multiple unknown prop warnings together', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div foo={() => {}} baz={() => {}} />, container);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid values for props %s on <%s> tag. Either remove them from the element, or pass a string or number value to keep them in the DOM. For details, see https://reactjs.org/link/attribute-behavior ',
        '`foo`, `baz`',
        'div',
      );
    });

    it('should warn for onDblClick prop', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div onDblClick={() => {}} />, container);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid event handler property `%s`. Did you mean `%s`?',
        'onDblClick',
        'onDoubleClick'
      );
    });

    it('should warn for unknown string event handlers', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div onUnknown='alert("hack")' />, container);
      expect(consoleErrorSpy.mock.calls[0]).toEqual([
        'Unknown event handler property `%s`. It will be ignored.',
        'onUnknown'
        ]
      );
      expect(container.firstChild.hasAttribute('onUnknown')).toBe(false);
      expect(container.firstChild.onUnknown).toBe(undefined);
      cocoMvc.render(<div onunknown={function() {}} />, container);
      expect(consoleErrorSpy.mock.calls[1]).toEqual(['Unknown event handler property `%s`. It will be ignored.', 'onunknown']);
      expect(container.firstChild.hasAttribute('onunknown')).toBe(false);
      expect(container.firstChild.onunknown).toBe(undefined);
      cocoMvc.render(<div on-unknown={function() {}} />, container);
      expect(consoleErrorSpy.mock.calls[2]).toEqual(['Unknown event handler property `%s`. It will be ignored.','on-unknown']);
      expect(container.firstChild.hasAttribute('on-unknown')).toBe(false);
      expect(container.firstChild['on-unknown']).toBe(undefined);
    })

    it('should warn for badly cased React attributes', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div CHILDREN="5" />, container)
      expect(consoleErrorSpy).toHaveBeenCalledWith(
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
      ReactTestUtils.renderIntoDocument(<Component />, cocoMvc);
    });

    it('should warn nicely about NaN in style', () => {
      const style = {fontSize: NaN};
      const div = document.createElement('div');
      cocoMvc.render(<span style={style} />, div);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '`NaN` is an invalid value for the `%s` css style property.',
        'fontSize',
      );
      cocoMvc.render(<span style={style} />, div);
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
      const test = () => cocoMvc.render(<span style={style} />, div);
      expect(test).toThrow();
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'The provided `%s` CSS property is an unsupported type %s. This value must be coerced to a string before before using it here.',
        `fontSize`,
        'TemporalLike',
      );
    });

    it('should update styles if initially null', () => {
      let styles = null;
      const container = document.createElement('div');
      cocoMvc.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;

      styles = {display: 'block'};

      cocoMvc.render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('block');
    });

    it('should update styles if updated to null multiple times', () => {
      let styles = null;
      const container = document.createElement('div');
      cocoMvc.render(<div style={styles} />, container);

      styles = {display: 'block'};
      const stubStyle = container.firstChild.style;

      cocoMvc.render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('block');

      cocoMvc.render(<div style={null} />, container);
      expect(stubStyle.display).toEqual('');

      cocoMvc.render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('block');

      cocoMvc.render(<div style={null} />, container);
      expect(stubStyle.display).toEqual('');
    });

    it('should render null and undefined as empty but print other falsy values', () => {
      const container = document.createElement('div');

      cocoMvc.render(
        <div dangerouslySetInnerHTML={{__html: 'textContent'}} />,
        container,
      );
      expect(container.textContent).toEqual('textContent');

      cocoMvc.render(<div dangerouslySetInnerHTML={{__html: 0}} />, container);
      expect(container.textContent).toEqual('0');

      cocoMvc.render(
        <div dangerouslySetInnerHTML={{__html: false}} />,
        container,
      );
      expect(container.textContent).toEqual('false');

      cocoMvc.render(
        <div dangerouslySetInnerHTML={{__html: ''}} />,
        container,
      );
      expect(container.textContent).toEqual('');

      cocoMvc.render(
        <div dangerouslySetInnerHTML={{__html: null}} />,
        container,
      );
      expect(container.textContent).toEqual('');

      cocoMvc.render(
        <div dangerouslySetInnerHTML={{__html: undefined}} />,
        container,
      );
      expect(container.textContent).toEqual('');
    });

    it('should remove attributes', () => {
      const container = document.createElement('div');
      cocoMvc.render(<img height="17" />, container);

      expect(container.firstChild.hasAttribute('height')).toBe(true);
      cocoMvc.render(<img />, container);
      expect(container.firstChild.hasAttribute('height')).toBe(false);
    });

    it('should remove properties', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div className="monkey" />, container);

      expect(container.firstChild.className).toEqual('monkey');
      cocoMvc.render(<div />, container);
      expect(container.firstChild.className).toEqual('');
    });

    it('should not set null/undefined attributes', () => {
      const container = document.createElement('div');
      // Initial render.
      cocoMvc.render(<img src={null} data-foo={undefined} />, container);
      const node = container.firstChild;
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
      // Update in one direction.
      cocoMvc.render(<img src={undefined} data-foo={null} />, container);
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
      // Update in another direction.
      cocoMvc.render(<img src={null} data-foo={undefined} />, container);
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
      // Removal.
      cocoMvc.render(<img />, container);
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
      // Addition.
      cocoMvc.render(<img src={undefined} data-foo={null} />, container);
      expect(node.hasAttribute('src')).toBe(false);
      expect(node.hasAttribute('data-foo')).toBe(false);
    })

    it('should apply React-specific aliases to HTML elements', () => {
      const container = document.createElement('div');
      cocoMvc.render(<form acceptCharset="foo" />, container);
      const node = container.firstChild;
      // Test attribute initialization.
      expect(node.getAttribute('accept-charset')).toBe('foo');
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Test attribute update.
      cocoMvc.render(<form acceptCharset="boo" />, container);
      expect(node.getAttribute('accept-charset')).toBe('boo');
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Test attribute removal by setting to null.
      cocoMvc.render(<form acceptCharset={null} />, container);
      expect(node.hasAttribute('accept-charset')).toBe(false);
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Restore.
      cocoMvc.render(<form acceptCharset="foo" />, container);
      expect(node.getAttribute('accept-charset')).toBe('foo');
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Test attribute removal by setting to undefined.
      cocoMvc.render(<form acceptCharset={undefined} />, container);
      expect(node.hasAttribute('accept-charset')).toBe(false);
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Restore.
      cocoMvc.render(<form acceptCharset="foo" />, container);
      expect(node.getAttribute('accept-charset')).toBe('foo');
      expect(node.hasAttribute('acceptCharset')).toBe(false);
      // Test attribute removal.
      cocoMvc.render(<form />, container);
      expect(node.hasAttribute('accept-charset')).toBe(false);
      expect(node.hasAttribute('acceptCharset')).toBe(false);
    });

    it('should apply React-specific aliases to SVG elements', () => {
      const container = document.createElement('div');
      cocoMvc.render(<svg arabicForm="foo" />, container);
      const node = container.firstChild;
      // Test attribute initialization.
      expect(node.getAttribute('arabic-form')).toBe('foo');
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Test attribute update.
      cocoMvc.render(<svg arabicForm="boo" />, container);
      expect(node.getAttribute('arabic-form')).toBe('boo');
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Test attribute removal by setting to null.
      cocoMvc.render(<svg arabicForm={null} />, container);
      expect(node.hasAttribute('arabic-form')).toBe(false);
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Restore.
      cocoMvc.render(<svg arabicForm="foo" />, container);
      expect(node.getAttribute('arabic-form')).toBe('foo');
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Test attribute removal by setting to undefined.
      cocoMvc.render(<svg arabicForm={undefined} />, container);
      expect(node.hasAttribute('arabic-form')).toBe(false);
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Restore.
      cocoMvc.render(<svg arabicForm="foo" />, container);
      expect(node.getAttribute('arabic-form')).toBe('foo');
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Test attribute removal.
      cocoMvc.render(<svg />, container);
      expect(node.hasAttribute('arabic-form')).toBe(false);
      expect(node.hasAttribute('arabicForm')).toBe(false);
    });

    it('should properly update custom attributes on custom elements', () => {
      const container = document.createElement('div');
      cocoMvc.render(<some-custom-element foo="bar" />, container);
      cocoMvc.render(<some-custom-element bar="buzz" />, container);
      const node = container.firstChild;
      expect(node.hasAttribute('foo')).toBe(false);
      expect(node.getAttribute('bar')).toBe('buzz');
    });

    it('should not apply React-specific aliases to custom elements', () => {
      const container = document.createElement('div');
      cocoMvc.render(<some-custom-element arabicForm="foo" />, container);
      const node = container.firstChild;
      // Should not get transformed to arabic-form as SVG would be.
      expect(node.getAttribute('arabicForm')).toBe('foo');
      expect(node.hasAttribute('arabic-form')).toBe(false);
      // Test attribute update.
      cocoMvc.render(<some-custom-element arabicForm="boo" />, container);
      expect(node.getAttribute('arabicForm')).toBe('boo');
      // Test attribute removal and addition.
      cocoMvc.render(<some-custom-element acceptCharset="buzz" />, container);
      // Verify the previous attribute was removed.
      expect(node.hasAttribute('arabicForm')).toBe(false);
      // Should not get transformed to accept-charset as HTML would be.
      expect(node.getAttribute('acceptCharset')).toBe('buzz');
      expect(node.hasAttribute('accept-charset')).toBe(false);
    });

    it('should clear a single style prop when changing `style`', () => {
      let styles = {display: 'none', color: 'red'};
      const container = document.createElement('div');
      cocoMvc.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;

      styles = {color: 'green'};
      cocoMvc.render(<div style={styles} />, container);
      expect(stubStyle.display).toEqual('');
      expect(stubStyle.color).toEqual('green');
    });

    it('should reject attribute key injection attack on mount for regular DOM', () => {
      for (let i = 0; i < 3; i++) {
        const container = document.createElement('div');
        cocoMvc.render(
          jsx(
            'div',
            {'blah" onclick="beevil" noise="hi': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
        cocoMvc.unmountComponentAtNode(container);
        cocoMvc.render(
          jsx(
            'div',
            {'></div><script>alert("hi")</script>': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
      }
      expect(consoleErrorSpy.mock.calls[0]).toEqual([
        'Invalid attribute name: `%s`',
        'blah" onclick="beevil" noise="hi',
      ]);
      expect(consoleErrorSpy.mock.calls[1]).toEqual([
        'Invalid attribute name: `%s`',
        '></div><script>alert("hi")</script>',
      ]);
    });

    it('should reject attribute key injection attack on mount for custom elements', () => {
      for (let i = 0; i < 3; i++) {
        const container = document.createElement('div');
        cocoMvc.render(
          jsx(
            'x-foo-component',
            {'blah" onclick="beevil" noise="hi': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
        cocoMvc.unmountComponentAtNode(container);
        cocoMvc.render(
          jsx(
            'x-foo-component',
            {'></x-foo-component><script>alert("hi")</script>': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
      }
      expect(consoleErrorSpy.mock.calls[0]).toEqual([
        'Invalid attribute name: `%s`',
        'blah" onclick="beevil" noise="hi',
      ]);
      expect(consoleErrorSpy.mock.calls[1]).toEqual([
        'Invalid attribute name: `%s`',
        '></x-foo-component><script>alert("hi")</script>',
      ]);
    });

    it('should reject attribute key injection attack on update for regular DOM', () => {
      for (let i = 0; i < 3; i++) {
        const container = document.createElement('div');
        const beforeUpdate = jsx('div', {}, null);
        cocoMvc.render(beforeUpdate, container);
        cocoMvc.render(
          jsx(
            'div',
            {'blah" onclick="beevil" noise="hi': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
        cocoMvc.render(
          jsx(
            'div',
            {'></div><script>alert("hi")</script>': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
      }
      expect(consoleErrorSpy.mock.calls[0]).toEqual([
        'Invalid attribute name: `%s`',
        'blah" onclick="beevil" noise="hi',
      ]);
      expect(consoleErrorSpy.mock.calls[1]).toEqual([
        'Invalid attribute name: `%s`',
        '></div><script>alert("hi")</script>',
      ]);
    });

    it('should reject attribute key injection attack on update for custom elements', () => {
      for (let i = 0; i < 3; i++) {
        const container = document.createElement('div');
        const beforeUpdate = jsx('x-foo-component', {}, null);
        cocoMvc.render(beforeUpdate, container);
        cocoMvc.render(
          jsx(
            'x-foo-component',
            {'blah" onclick="beevil" noise="hi': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
        cocoMvc.render(
          jsx(
            'x-foo-component',
            {'></x-foo-component><script>alert("hi")</script>': 'selected'},
            null,
          ),
          container,
        );
        expect(container.firstChild.attributes.length).toBe(0);
      }
      expect(consoleErrorSpy.mock.calls[0]).toEqual([
        'Invalid attribute name: `%s`',
        'blah" onclick="beevil" noise="hi',
      ]);
      expect(consoleErrorSpy.mock.calls[1]).toEqual([
        'Invalid attribute name: `%s`',
        '></x-foo-component><script>alert("hi")</script>',
      ]);
    });

    it('should update arbitrary attributes for tags containing dashes', () => {
      const container = document.createElement('div');

      const beforeUpdate = jsx('x-foo-component', {}, null);
      cocoMvc.render(beforeUpdate, container);

      const afterUpdate = <x-foo-component myattr="myval" />;
      cocoMvc.render(afterUpdate, container);

      expect(container.childNodes[0].getAttribute('myattr')).toBe('myval');
    });

    it('should clear all the styles when removing `style`', () => {
      const styles = {display: 'none', color: 'red'};
      const container = document.createElement('div');
      cocoMvc.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;

      cocoMvc.render(<div />, container);
      expect(stubStyle.display).toEqual('');
      expect(stubStyle.color).toEqual('');
    });

    it('should update styles when `style` changes from null to object', () => {
      const container = document.createElement('div');
      const styles = {color: 'red'};
      cocoMvc.render(<div style={styles} />, container);
      cocoMvc.render(<div />, container);
      cocoMvc.render(<div style={styles} />, container);

      const stubStyle = container.firstChild.style;
      expect(stubStyle.color).toEqual('red');
    });

    it('should not reset innerHTML for when children is null', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div />, container);
      container.firstChild.innerHTML = 'bonjour';
      expect(container.firstChild.innerHTML).toEqual('bonjour');

      cocoMvc.render(<div />, container);
      expect(container.firstChild.innerHTML).toEqual('bonjour');
    });

    it('should reset innerHTML when switching from a direct text child to an empty child', () => {
      const transitionToValues = [null, undefined, false];
      transitionToValues.forEach(transitionToValue => {
        const container = document.createElement('div');
        cocoMvc.render(<div>bonjour</div>, container);
        expect(container.firstChild.innerHTML).toEqual('bonjour');

        cocoMvc.render(<div>{null}</div>, container);
        expect(container.firstChild.innerHTML).toEqual('');
      });
    });

    it('should empty element when removing innerHTML', () => {
      const container = document.createElement('div');
      cocoMvc.render(
        <div dangerouslySetInnerHTML={{__html: ':)'}} />,
        container,
      );

      expect(container.firstChild.innerHTML).toEqual(':)');
      cocoMvc.render(<div />, container);
      expect(container.firstChild.innerHTML).toEqual('');
    });

    it('should transition from string content to innerHTML', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div>hello</div>, container);

      expect(container.firstChild.innerHTML).toEqual('hello');
      cocoMvc.render(
        <div dangerouslySetInnerHTML={{__html: 'goodbye'}} />,
        container,
      );
      expect(container.firstChild.innerHTML).toEqual('goodbye');
    });

    it('should transition from innerHTML to string content', () => {
      const container = document.createElement('div');
      cocoMvc.render(
        <div dangerouslySetInnerHTML={{__html: 'bonjour'}} />,
        container,
      );

      expect(container.firstChild.innerHTML).toEqual('bonjour');
      cocoMvc.render(<div>adieu</div>, container);
      expect(container.firstChild.innerHTML).toEqual('adieu');
    });

    it('should transition from innerHTML to children in nested el', () => {
      const container = document.createElement('div');
      cocoMvc.render(
        <div>
          <div dangerouslySetInnerHTML={{__html: 'bonjour'}} />
        </div>,
        container,
      );

      expect(container.textContent).toEqual('bonjour');
      cocoMvc.render(
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
      cocoMvc.render(
        <div>
          <div>
            <span>adieu</span>
          </div>
        </div>,
        container,
      );

      expect(container.textContent).toEqual('adieu');
      cocoMvc.render(
        <div>
          <div dangerouslySetInnerHTML={{__html: 'bonjour'}} />
        </div>,
        container,
      );
      expect(container.textContent).toEqual('bonjour');
    });

    it('should not incur unnecessary DOM mutations for attributes', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div id="" />, container);

      const node = container.firstChild;
      const nodeSetAttribute = node.setAttribute;
      node.setAttribute = jest.fn();
      node.setAttribute.mockImplementation(nodeSetAttribute);

      const nodeRemoveAttribute = node.removeAttribute;
      node.removeAttribute = jest.fn();
      node.removeAttribute.mockImplementation(nodeRemoveAttribute);

      cocoMvc.render(<div id="" />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(0);
      expect(node.removeAttribute).toHaveBeenCalledTimes(0);

      cocoMvc.render(<div id="foo" />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(1);
      expect(node.removeAttribute).toHaveBeenCalledTimes(0);

      cocoMvc.render(<div id="foo" />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(1);
      expect(node.removeAttribute).toHaveBeenCalledTimes(0);

      cocoMvc.render(<div />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(1);
      expect(node.removeAttribute).toHaveBeenCalledTimes(1);

      cocoMvc.render(<div id="" />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(2);
      expect(node.removeAttribute).toHaveBeenCalledTimes(1);

      cocoMvc.render(<div />, container);
      expect(node.setAttribute).toHaveBeenCalledTimes(2);
      expect(node.removeAttribute).toHaveBeenCalledTimes(2);
    });

    it('should not incur unnecessary DOM mutations for string properties', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div value="" />, container);

      const node = container.firstChild;

      const nodeValueSetter = jest.fn();

      const oldSetAttribute = node.setAttribute.bind(node);
      node.setAttribute = function(key, value) {
        oldSetAttribute(key, value);
        nodeValueSetter(key, value);
      };

      cocoMvc.render(<div value="foo" />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      cocoMvc.render(<div value="foo" />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      cocoMvc.render(<div />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      cocoMvc.render(<div value={null} />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      cocoMvc.render(<div value="" />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(2);

      cocoMvc.render(<div />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(2);
    });

    it('should not incur unnecessary DOM mutations for boolean properties', () => {
      const container = document.createElement('div');
      cocoMvc.render(<div checked={true} />, container);

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

      cocoMvc.render(<div checked={true} />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(0);

      cocoMvc.render(<div />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(1);

      cocoMvc.render(<div checked={false} />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(2);

      cocoMvc.render(<div checked={true} />, container);
      expect(nodeValueSetter).toHaveBeenCalledTimes(3);
    });

    it('should not update when switching between null/undefined', () => {
      const container = document.createElement('div');
      const node = cocoMvc.render(<div />, container);

      const setter = jest.fn();
      node.setAttribute = setter;

      cocoMvc.render(<div dir={null} />, container);
      cocoMvc.render(<div dir={undefined} />, container);
      cocoMvc.render(<div />, container);
      expect(setter).toHaveBeenCalledTimes(0);
      cocoMvc.render(<div dir="ltr" />, container);
      expect(setter).toHaveBeenCalledTimes(1);
    });

    it('handles multiple child updates without interference', () => {
      // This test might look like it's just testing ReactMultiChild but the
      // last bug in this was actually in DOMChildrenOperations so this test
      // needs to be in some DOM-specific test file.
      const container = document.createElement('div');

      // ABCD
      cocoMvc.render(
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
      cocoMvc.render(
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
        cocoMvc.render(<div {...props} />, container);
      };
    });

    it('should work error event on <source> element', () => {
      const container = document.createElement('div');
      cocoMvc.render(
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
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
        expect(consoleErrorSpy).toHaveBeenCalledWith('onError called');
      }
    });

    it('should warn on upper case HTML tags, not SVG nor custom tags', () => {
      ReactTestUtils.renderIntoDocument(
        jsx('svg', null, jsx('PATH')),
        cocoMvc
      );
      ReactTestUtils.renderIntoDocument(jsx('CUSTOM-TAG'), cocoMvc);

      ReactTestUtils.renderIntoDocument(jsx('IMG'), cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        '<%s /> is using incorrect casing. ' +
        'Use PascalCase for React components, ' +
        'or lowercase for HTML elements.',
        'IMG'
      );
    });

    it('should warn on props reserved for future use', () => {
      ReactTestUtils.renderIntoDocument(<div aria="hello" />, cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
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
        ReactTestUtils.renderIntoDocument(<bar />, cocoMvc);
        expect(consoleErrorSpy.mock.calls[0]).toEqual(
          [
            "The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.",
            "bar",
          ]
        );
        // Test deduplication
        ReactTestUtils.renderIntoDocument(<foo />, cocoMvc);
        expect(consoleErrorSpy.mock.calls[1]).toEqual(
          [
            "The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.",
            "foo",
          ]
        );
        ReactTestUtils.renderIntoDocument(<foo />, cocoMvc);
        ReactTestUtils.renderIntoDocument(<time />, cocoMvc);
        // Corner case. Make sure out deduplication logic doesn't break with weird tag.
        ReactTestUtils.renderIntoDocument(<hasOwnProperty />, cocoMvc);
        expect(consoleErrorSpy.mock.calls[2]).toEqual([
          '<%s /> is using incorrect casing. ' +
          'Use PascalCase for React components, ' +
          'or lowercase for HTML elements.',
          'hasOwnProperty'
        ]);
        expect(consoleErrorSpy.mock.calls[3]).toEqual([
          "The tag <%s> is unrecognized in this browser. If you meant to render a React component, start its name with an uppercase letter.",
          'hasOwnProperty',
        ])
      } finally {
        Object.prototype.toString = realToString; // eslint-disable-line no-extend-native
      }
    });

    it('should throw on children for void elements', () => {
      const container = document.createElement('div');
      expect(() => {
        cocoMvc.render(<input>children</input>, container);
      }).toThrow(
        'input is a void element tag and must neither have `children` nor ' +
        'use `dangerouslySetInnerHTML`.',
      )
    });

    it('should throw on dangerouslySetInnerHTML for void elements', () => {
      const container = document.createElement('div');
      expect(() => {
        cocoMvc.render(
          <input dangerouslySetInnerHTML={{__html: 'content'}} />,
          container,
        );
      }).toThrow(
        'input is a void element tag and must neither have `children` nor ' +
        'use `dangerouslySetInnerHTML`.',
      );
    });

    it('should validate against multiple children props', () => {
      expect(function() {
        mountComponent({children: '', dangerouslySetInnerHTML: ''});
      }).toThrow(
        'Can only set one of `children` or `props.dangerouslySetInnerHTML`.',
      );
    });

    it('should validate against use of innerHTML', () => {
      mountComponent({innerHTML: '<span>Hi Jim!</span>'});
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Directly setting property `innerHTML` is not permitted. ' +
        'For more information, lookup documentation on `dangerouslySetInnerHTML`.',
      );
    });

    it('should validate against use of innerHTML without case sensitivity', () => {
      mountComponent({innerhtml: '<span>Hi Jim!</span>'});
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Directly setting property `innerHTML` is not permitted. ' +
        'For more information, lookup documentation on `dangerouslySetInnerHTML`.',
      );
    });

    it('should validate use of dangerouslySetInnerHTML', () => {
      expect(function() {
        mountComponent({dangerouslySetInnerHTML: '<span>Hi Jim!</span>'});
      }).toThrow(
        '`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. ' +
        'Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.',
      );
    });

    it('should validate use of dangerouslySetInnerHTML', () => {
      expect(function() {
        mountComponent({dangerouslySetInnerHTML: {foo: 'bar'}});
      }).toThrowError(
        '`props.dangerouslySetInnerHTML` must be in the form `{__html: ...}`. ' +
        'Please visit https://reactjs.org/link/dangerously-set-inner-html for more information.',
      );
    });

    it('should allow {__html: null}', () => {
      expect(function() {
        mountComponent({dangerouslySetInnerHTML: {__html: null}});
      }).not.toThrow();
    });

    it('should warn about contentEditable and children', () => {
      mountComponent({contentEditable: true, children: ''});
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'A component is `contentEditable` and contains `children` managed by ' +
        'React. It is now your responsibility to guarantee that none of ' +
        'those nodes are unexpectedly modified or duplicated. This is ' +
        'probably not intentional.',
      );
    });

    it('should respect suppressContentEditableWarning', () => {
      mountComponent({
        contentEditable: true,
        children: '',
        suppressContentEditableWarning: true,
      });
    });

    it('should validate against invalid styles', () => {
      expect(function() {
        mountComponent({style: 'display: none'});
      }).toThrowError(
        'The `style` prop expects a mapping from style properties to values, ' +
        "not a string. For example, style={{marginRight: spacing + 'em'}} " +
        'when using JSX.',
      );
    });

    it('should throw for children on void elements', () => {
      @view()
      class X {
        render() {
          return <input>moo</input>;
        }
      }

      application.start();
      const container = document.createElement('div');
      expect(() => {
        cocoMvc.render(<X />, container);
      }).toThrowError(
        'input is a void element tag and must neither have `children` ' +
        'nor use `dangerouslySetInnerHTML`.',
      );
    });

    it('should work load and error events on <image> element in SVG', () => {
      const container = document.createElement('div');
      cocoMvc.render(
        <svg>
          <image
            xlinkHref="http://example.org/image"
            onError={e => console.log('onError called')}
            onLoad={e => console.log('onLoad called')}
          />
        </svg>,
        container,
      );

      const loadEvent = document.createEvent('Event');
      const errorEvent = document.createEvent('Event');

      loadEvent.initEvent('load', false, false);
      errorEvent.initEvent('error', false, false);

      container.getElementsByTagName('image')[0].dispatchEvent(errorEvent);
      container.getElementsByTagName('image')[0].dispatchEvent(loadEvent);

      if (__DEV__) {
        expect(consoleLogSpy).toHaveBeenCalledTimes(2);
        expect(consoleLogSpy.mock.calls[0]).toEqual(['onError called']);
        expect(consoleLogSpy.mock.calls[1]).toEqual(['onLoad called']);
      }
    });

    it('should receive a load event on <link> elements', () => {
      const container = document.createElement('div');
      const onLoad = jest.fn();

      cocoMvc.render(
        <link href="http://example.org/link" onLoad={onLoad} />,
        container,
      );

      const loadEvent = document.createEvent('Event');
      const link = container.getElementsByTagName('link')[0];

      loadEvent.initEvent('load', false, false);
      link.dispatchEvent(loadEvent);

      expect(onLoad).toHaveBeenCalledTimes(1);
    });

    it('should receive an error event on <link> elements', () => {
      const container = document.createElement('div');
      const onError = jest.fn();

      cocoMvc.render(
        <link href="http://example.org/link" onError={() => {
          console.info('onError called');
          onError();
        }} />,
        container,
      );

      const errorEvent = document.createEvent('Event');
      const link = container.getElementsByTagName('link')[0];

      errorEvent.initEvent('error', false, false);
      link.dispatchEvent(errorEvent);

      expect(onError).toHaveBeenCalledTimes(1);
    });
  })

  describe('updateComponent', () => {
    let container;

    beforeEach(() => {
      container = document.createElement('div');
    });

    it('should warn against children for void elements', () => {
      cocoMvc.render(<input />, container);

      expect(function() {
        cocoMvc.render(<input>children</input>, container);
      }).toThrow(
        'input is a void element tag and must neither have `children` nor use ' +
        '`dangerouslySetInnerHTML`.',
      );
    });

    it('should warn against dangerouslySetInnerHTML for void elements', () => {
      cocoMvc.render(<input />, container);

      expect(function() {
        cocoMvc.render(
          <input dangerouslySetInnerHTML={{__html: 'content'}} />,
          container,
        );
      }).toThrowError(
        'input is a void element tag and must neither have `children` nor use ' +
        '`dangerouslySetInnerHTML`.',
      );
    });

    it('should validate against multiple children props', () => {
      cocoMvc.render(<div />, container);

      expect(function() {
        cocoMvc.render(
          <div children="" dangerouslySetInnerHTML={{__html: ''}} />,
          container,
        );
      }).toThrowError(
        'Can only set one of `children` or `props.dangerouslySetInnerHTML`.',
      );
    });

    it('should warn about contentEditable and children', () => {
      cocoMvc.render(
        <div contentEditable={true}>
          <div />
        </div>,
        container,
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'A component is `contentEditable` and contains `children` managed by ' +
        'React. It is now your responsibility to guarantee that none of ' +
        'those nodes are unexpectedly modified or duplicated. This is ' +
        'probably not intentional.',
      );
    });

    it('should validate against invalid styles', () => {
      cocoMvc.render(<div />, container);

      expect(function() {
        cocoMvc.render(<div style={1} />, container);
      }).toThrow(
        'The `style` prop expects a mapping from style properties to values, ' +
        "not a string. For example, style={{marginRight: spacing + 'em'}} " +
        'when using JSX.',
      );
    });

    it('should report component containing invalid styles', () => {
      @view()
      class Animal {
        render() {
          return <div style={1} />;
        }
      }

      application.start();
      expect(() => {
        cocoMvc.render(<Animal />, container);
      }).toThrowError(
        'The `style` prop expects a mapping from style properties to values, ' +
        "not a string. For example, style={{marginRight: spacing + 'em'}} " +
        'when using JSX.',
      );
    });
  })

  describe('unmountComponent', () => {
    it('unmounts children before unsetting DOM node info', () => {
      @view()
      class Inner {
        render() {
          return <span />;
        }

        viewWillUnmount() {
          // Should not throw
          expect(cocoMvc.findDOMNode(this).nodeName).toBe('SPAN');
        }
      }

      application.start();
      const container = document.createElement('div');
      cocoMvc.render(
        <div>
          <Inner />
        </div>,
        container,
      );
      cocoMvc.unmountComponentAtNode(container);
    })
  })

  describe('tag sanitization', () => {
    it('should throw when an invalid tag name is used', () => {
      const hackzor = jsx('script tag');
      expect(() => ReactTestUtils.renderIntoDocument(hackzor, cocoMvc)).toThrow();
    });

    it('should throw when an attack vector is used', () => {
      const hackzor = jsx('div><img /><div');
      expect(() => ReactTestUtils.renderIntoDocument(hackzor, cocoMvc)).toThrow();
    });
  })

  describe('nesting validation', () => {
    it('warns on invalid nesting', () => {
      ReactTestUtils.renderIntoDocument(
        <div>
          <tr />
          <tr />
        </div>,
        cocoMvc
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'validateDOMNesting(...): %s cannot appear as a child of <%s>.%s%s',
        '<tr>',
        'div',
        '', ''
      );
    });

    it('warns on invalid nesting at root', () => {
      const p = document.createElement('p');

      cocoMvc.render(
        <span><p /></span>,
        p,
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "validateDOMNesting(...): %s cannot appear as a descendant of <%s>.",
        "<p>",
        "p"
      );
    });

    it('warns nicely for table rows', () => {
      @view()
      class Row {
        render() {
          return <tr>x</tr>;
        }
      }

      @view()
      class Foo {
        render() {
          return (
            <table>
              <Row />{' '}
            </table>
          );
        }
      }

      application.start();
      const container = document.createElement('div');
      cocoMvc.render(
        <Foo />,
        container,
      );
      // ReactTestUtils.renderIntoDocument(<Foo />, render);
      expect(consoleErrorSpy.mock.calls[0]).toEqual(
        [
          "validateDOMNesting(...): %s cannot appear as a child of <%s>.%s%s",
          "<tr>", "table",
          "",
          " Add a <tbody>, <thead> or <tfoot> to your code to match the DOM tree generated by the browser.",
        ]
      );
      expect(consoleErrorSpy.mock.calls[1]).toEqual(
        [
          "validateDOMNesting(...): %s cannot appear as a child of <%s>.%s%s",
          "Text nodes", "tr",
          "",
          "",
        ]
      );
      expect(consoleErrorSpy.mock.calls[2]).toEqual(
        [
          "validateDOMNesting(...): %s cannot appear as a child of <%s>.%s%s",
          "Whitespace text nodes", "table",
          " Make sure you don't have any extra whitespace between tags on each line of your source code.",
          "",
        ]
      );
    });

    it('should warn about incorrect casing on properties', () => {
      ReactTestUtils.renderIntoDocument(
        jsx('input', {type: 'text', tabindex: '1'}),
        cocoMvc
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Invalid DOM property `%s`. Did you mean `%s`?",
        "tabindex",
        "tabIndex"
      );
    });

    it('should warn about incorrect casing on event handlers', () => {
      ReactTestUtils.renderIntoDocument(
        jsx('input', {type: 'text', oninput: '1'}),
        cocoMvc
      );
      expect(consoleErrorSpy.mock.calls[0]).toEqual([
          "Unknown event handler property `%s`. It will be ignored.",
          "oninput"
        ]
      );
      ReactTestUtils.renderIntoDocument(
        jsx('input', {type: 'text', onKeydown: '1'}),
        cocoMvc
      );
      expect(consoleErrorSpy.mock.calls[1]).toEqual(
        [
          "Unknown event handler property `%s`. It will be ignored.",
          'onKeydown',
        ]
      );
    });

    it('should warn about class', () => {
      ReactTestUtils.renderIntoDocument(
        jsx('div', {class: 'muffins'}),
        cocoMvc
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Invalid DOM property `%s`. Did you mean `%s`?", "class", "className"
      );
    });

    it('should warn about props that are no longer supported', () => {
      ReactTestUtils.renderIntoDocument(<div />, cocoMvc);

      ReactTestUtils.renderIntoDocument(<div onFocusIn={() => {}} />, cocoMvc);
      expect(consoleErrorSpy.mock.calls[0]).toEqual(
        [
          'React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' +
          'All React events are normalized to bubble, so onFocusIn and onFocusOut ' +
          'are not needed/supported by React.'
        ]
      );
      ReactTestUtils.renderIntoDocument(<div onFocusOut={() => {}} />, cocoMvc);
      expect(consoleErrorSpy.mock.calls[1]).toEqual(
        [
          'React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' +
          'All React events are normalized to bubble, so onFocusIn and onFocusOut ' +
          'are not needed/supported by React.'
        ]
      );
    });

    it('should warn about props that are no longer supported without case sensitivity', () => {
      ReactTestUtils.renderIntoDocument(<div />, cocoMvc);
      ReactTestUtils.renderIntoDocument(<div onfocusin={() => {}} />, cocoMvc);
      expect(consoleErrorSpy.mock.calls[0]).toEqual(
        [
          'React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' +
          'All React events are normalized to bubble, so onFocusIn and onFocusOut ' +
          'are not needed/supported by React.'
        ]
      );
      ReactTestUtils.renderIntoDocument(<div onfocusout={() => {}} />, cocoMvc);
      expect(consoleErrorSpy.mock.calls[1]).toEqual(
        [
          'React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' +
          'All React events are normalized to bubble, so onFocusIn and onFocusOut ' +
          'are not needed/supported by React.'
        ]
      );
    });

    it('gives source code refs for unknown prop warning', () => {
      ReactTestUtils.renderIntoDocument(<div class="paladin" />, cocoMvc);
      expect(consoleErrorSpy.mock.calls[0]).toEqual([
        "Invalid DOM property `%s`. Did you mean `%s`?",
        "class",
        "className"
      ]);
      ReactTestUtils.renderIntoDocument(<input type="text" onclick="1" />, cocoMvc);
      expect(consoleErrorSpy.mock.calls[1]).toEqual(
        ["Invalid event handler property `%s`. Did you mean `%s`?", "onclick", "onClick"]
      );
    });

    it('gives source code refs for unknown prop warning for update render', () => {
      const container = document.createElement('div');

      ReactTestUtils.renderIntoDocument(<div className="paladin" />, cocoMvc);
      ReactTestUtils.renderIntoDocument(<div class="paladin" />, cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid DOM property `%s`. Did you mean `%s`?',
        'class',
        'className'
      );
    });

    it('gives source code refs for unknown prop warning for exact elements', () => {
      ReactTestUtils.renderIntoDocument(
        <div className="foo1">
          <span class="foo2" />
          <div onClick={() => {}} />
          <strong onclick={() => {}} />
          <div className="foo5" />
          <div className="foo6" />
        </div>,
        cocoMvc
      );
      expect(consoleErrorSpy.mock.calls[0]).toEqual([
        "Invalid DOM property `%s`. Did you mean `%s`?", "class", "className"
      ]);
      expect(consoleErrorSpy.mock.calls[1]).toEqual([
        "Invalid event handler property `%s`. Did you mean `%s`?", "onclick", "onClick"
      ]);
    });

    it('gives source code refs for unknown prop warning for exact elements in composition', () => {
      const container = document.createElement('div');

      @view()
      class Parent {
        render() {
          return (
            <div>
              <Child1 />
              <Child2 />
              <Child3 />
              <Child4 />
            </div>
          );
        }
      }

      @view()
      class Child1 {
        render() {
          return <span class="paladin">Child1</span>;
        }
      }

      @view()
      class Child2 {
        render() {
          return <div>Child2</div>;
        }
      }

      @view()
      class Child3 {
        render() {
          return <strong onclick="1">Child3</strong>;
        }
      }

      @view()
      class Child4 {
        render() {
          return <div>Child4</div>;
        }
      }

      application.start();
      ReactTestUtils.renderIntoDocument(<Parent />, cocoMvc)
        expect(consoleErrorSpy.mock.calls[0]).toEqual([
          "Invalid DOM property `%s`. Did you mean `%s`?", "class", "className"
        ]);
      expect(consoleErrorSpy.mock.calls[1]).toEqual([
        "Invalid event handler property `%s`. Did you mean `%s`?", "onclick", "onClick"
      ]);
    });

    it('should suggest property name if available', () => {
      ReactTestUtils.renderIntoDocument(
        jsx('label', {for: 'test'}),
        cocoMvc
      );
      expect(consoleErrorSpy.mock.calls[0]).toEqual([
          'Invalid DOM property `%s`. Did you mean `%s`?',
          'for',
          'htmlFor'
      ]
      );

      ReactTestUtils.renderIntoDocument(
        jsx('input', {type: 'text', autofocus: true}),
        cocoMvc
      );
      expect(consoleErrorSpy.mock.calls[1]).toEqual([
          'Invalid DOM property `%s`. Did you mean `%s`?',
          'autofocus',
          'autoFocus'
        ]
      );
    });
  })

  describe('whitespace', () => {
    it('renders innerHTML and preserves whitespace', () => {
      const container = document.createElement('div');
      const html = '\n  \t  <span>  \n  testContent  \t  </span>  \n  \t';
      const elem = <div dangerouslySetInnerHTML={{__html: html}} />;

      cocoMvc.render(elem, container);
      expect(container.firstChild.innerHTML).toBe(html);
    });

    it('render and then updates innerHTML and preserves whitespace', () => {
      const container = document.createElement('div');
      const html = '\n  \t  <span>  \n  testContent1  \t  </span>  \n  \t';
      const elem = <div dangerouslySetInnerHTML={{__html: html}} />;
      cocoMvc.render(elem, container);

      const html2 = '\n  \t  <div>  \n  testContent2  \t  </div>  \n  \t';
      const elem2 = <div dangerouslySetInnerHTML={{__html: html2}} />;
      cocoMvc.render(elem2, container);

      expect(container.firstChild.innerHTML).toBe(html2);
    });
  })

  describe('Attributes with aliases', function() {
    it('sets aliased attributes on HTML attributes', function() {
      let el = ReactTestUtils.renderIntoDocument(<div class="test" />, cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid DOM property `%s`. Did you mean `%s`?',
        'class',
        'className'
      );
      expect(el.className).toBe('test');
    });

    it('sets incorrectly cased aliased attributes on HTML attributes with a warning', function() {
      let el = ReactTestUtils.renderIntoDocument(<div cLASS="test" />, cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid DOM property `%s`. Did you mean `%s`?',
        'cLASS',
        'className'
      );
      expect(el.className).toBe('test');
    });

    it('sets aliased attributes on SVG elements with a warning', function() {
      let el = ReactTestUtils.renderIntoDocument(
        <svg>
          <text arabic-form="initial" />
        </svg>,
        cocoMvc
      );
      expect(consoleErrorSpy.mock.calls[1]).toEqual([
          'Invalid DOM property `%s`. Did you mean `%s`?',
          'arabic-form',
          'arabicForm'
        ]
      );

      const text = el.querySelector('text');
      expect(text.hasAttribute('arabic-form')).toBe(true);
    });

    it('updates aliased attributes on custom elements', function() {
      const container = document.createElement('div');
      cocoMvc.render(<div is="custom-element" class="foo" />, container);
      cocoMvc.render(<div is="custom-element" class="bar" />, container);

      expect(container.firstChild.getAttribute('class')).toBe('bar');
    });
  })

  describe('Custom attributes', function() {
    it('allows assignment of custom attributes with string values', function() {
      const el = ReactTestUtils.renderIntoDocument(<div whatever="30" />, cocoMvc);

      expect(el.getAttribute('whatever')).toBe('30');
    });

    it('removes custom attributes', function() {
      const container = document.createElement('div');
      cocoMvc.render(<div whatever="30" />, container);

      expect(container.firstChild.getAttribute('whatever')).toBe('30');

      cocoMvc.render(<div whatever={null} />, container);

      expect(container.firstChild.hasAttribute('whatever')).toBe(false);
    });

    it('does not assign a boolean custom attributes as a string', function() {
      let el = ReactTestUtils.renderIntoDocument(<div whatever={true} />, cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Received `%s` for a non-boolean attribute `%s`.\n\n' +
        'If you want to write it to the DOM, pass a string instead: ' +
        '%s="%s" or %s={value.toString()}.',
        true,
        'whatever',
        "whatever",
        true,
        "whatever"
      );

      expect(el.hasAttribute('whatever')).toBe(false);
    });

    it('does not assign an implicit boolean custom attributes', function() {
      let el = ReactTestUtils.renderIntoDocument(<div whatever />, cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Received `%s` for a non-boolean attribute `%s`.\n\n' +
        'If you want to write it to the DOM, pass a string instead: ' +
        '%s="%s" or %s={value.toString()}.',
        true,
        'whatever',
        "whatever",
        true,
        "whatever"
      );

      expect(el.hasAttribute('whatever')).toBe(false);
    });

    it('assigns a numeric custom attributes as a string', function() {
      const el = ReactTestUtils.renderIntoDocument(<div whatever={3} />, cocoMvc);

      expect(el.getAttribute('whatever')).toBe('3');
    });

    it('will not assign a function custom attributes', function() {
      let el = ReactTestUtils.renderIntoDocument(<div whatever={() => {}} />, cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior ",
        "`whatever`",
        "div"
      );

      expect(el.hasAttribute('whatever')).toBe(false);
    });

    it('will assign an object custom attributes', function() {
      const el = ReactTestUtils.renderIntoDocument(<div whatever={{}} />, cocoMvc);
      expect(el.getAttribute('whatever')).toBe('[object Object]');
    });

    it('allows Temporal-like objects as HTML (they are not coerced to strings first)', function() {
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

      // `dangerouslySetInnerHTML` is never coerced to a string, so won't throw
      // even with a Temporal-like object.
      const container = document.createElement('div');
      cocoMvc.render(
        <div dangerouslySetInnerHTML={{__html: new TemporalLike()}} />,
        container,
      );
      expect(container.firstChild.innerHTML).toEqual('2020-01-01');
    });

    it('allows cased data attributes', function() {
      let el = ReactTestUtils.renderIntoDocument(<div data-fooBar="true" />, cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'React does not recognize the `%s` prop on a DOM element. If you ' +
        'intentionally want it to appear in the DOM as a custom ' +
        'attribute, spell it as lowercase `%s` instead. ' +
        'If you accidentally passed it from a parent component, remove ' +
        'it from the DOM element.',
        'data-fooBar',
        'data-foobar'
      );
      expect(el.getAttribute('data-foobar')).toBe('true');
    });

    it('allows cased custom attributes', function() {
      let el = ReactTestUtils.renderIntoDocument(<div fooBar="true" />, cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'React does not recognize the `%s` prop on a DOM element. If you ' +
        'intentionally want it to appear in the DOM as a custom ' +
        'attribute, spell it as lowercase `%s` instead. ' +
        'If you accidentally passed it from a parent component, remove ' +
        'it from the DOM element.',
        'fooBar',
        'foobar'
      );
      expect(el.getAttribute('foobar')).toBe('true');
    });

    it('warns on NaN attributes', function() {
      let el = ReactTestUtils.renderIntoDocument(<div whatever={NaN} />, cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Received NaN for the `%s` attribute. If this is ' +
        'expected, cast the value to a string.',
        'whatever'
      );

      expect(el.getAttribute('whatever')).toBe('NaN');
    });

    it('removes a property when it becomes invalid', function() {
      const container = document.createElement('div');
      cocoMvc.render(<div whatever={0} />, container);
      cocoMvc.render(<div whatever={() => {}} />, container);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior ',
        '`whatever`',
        'div'
      );
      const el = container.firstChild;
      expect(el.hasAttribute('whatever')).toBe(false);
    });

    it('warns on bad casing of known HTML attributes', function() {
      let el = ReactTestUtils.renderIntoDocument(<div SiZe="30" />, cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Invalid DOM property `%s`. Did you mean `%s`?", "SiZe", "size"
      );

      expect(el.getAttribute('size')).toBe('30');
    });
  })

  describe('Object stringification', function() {
    it('allows objects on known properties', function() {
      const el = ReactTestUtils.renderIntoDocument(<div acceptCharset={{}} />, cocoMvc);
      expect(el.getAttribute('accept-charset')).toBe('[object Object]');
    });

    it('should pass objects as attributes if they define toString', () => {
      const obj = {
        toString() {
          return 'hello';
        },
      };
      const container = document.createElement('div');

      cocoMvc.render(<img src={obj} />, container);
      expect(container.firstChild.src).toBe('http://localhost/hello');

      cocoMvc.render(<svg arabicForm={obj} />, container);
      expect(container.firstChild.getAttribute('arabic-form')).toBe('hello');

      cocoMvc.render(<div unknown={obj} />, container);
      expect(container.firstChild.getAttribute('unknown')).toBe('hello');
    });

    it('passes objects on known SVG attributes if they do not define toString', () => {
      const obj = {};
      const container = document.createElement('div');

      cocoMvc.render(<svg arabicForm={obj} />, container);
      expect(container.firstChild.getAttribute('arabic-form')).toBe(
        '[object Object]',
      );
    });

    it('passes objects on custom attributes if they do not define toString', () => {
      const obj = {};
      const container = document.createElement('div');

      cocoMvc.render(<div unknown={obj} />, container);
      expect(container.firstChild.getAttribute('unknown')).toBe(
        '[object Object]',
      );
    });

    it('allows objects that inherit a custom toString method', function() {
      const parent = {toString: () => 'hello.jpg'};
      const child = Object.create(parent);
      const el = ReactTestUtils.renderIntoDocument(<img src={child} />, cocoMvc);

      expect(el.src).toBe('http://localhost/hello.jpg');
    });

    it('assigns ajaxify (an important internal FB attribute)', function() {
      const options = {toString: () => 'ajaxy'};
      const el = ReactTestUtils.renderIntoDocument(<div ajaxify={options} />, cocoMvc);

      expect(el.getAttribute('ajaxify')).toBe('ajaxy');
    });
  })

  describe('String boolean attributes', function() {
    it('does not assign string boolean attributes for custom attributes', function() {
      let el = ReactTestUtils.renderIntoDocument(<div whatever={true} />, cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Received `%s` for a non-boolean attribute `%s`.\n\n' +
        'If you want to write it to the DOM, pass a string instead: ' +
        '%s="%s" or %s={value.toString()}.',
        true,
        "whatever",
        "whatever",
        true,
        "whatever"
      );

      expect(el.hasAttribute('whatever')).toBe(false);
    });

    it('stringifies the boolean true for allowed attributes', function() {
      const el = ReactTestUtils.renderIntoDocument(<div spellCheck={true} />, cocoMvc);

      expect(el.getAttribute('spellCheck')).toBe('true');
    });

    it('stringifies the boolean false for allowed attributes', function() {
      const el = ReactTestUtils.renderIntoDocument(<div spellCheck={false} />, cocoMvc);

      expect(el.getAttribute('spellCheck')).toBe('false');
    });

    it('stringifies implicit booleans for allowed attributes', function() {
      // eslint-disable-next-line react/jsx-boolean-value
      const el = ReactTestUtils.renderIntoDocument(<div spellCheck />, cocoMvc);

      expect(el.getAttribute('spellCheck')).toBe('true');
    });
  })

  describe('Boolean attributes', function() {
    it('warns on the ambiguous string value "false"', function() {
      let el = ReactTestUtils.renderIntoDocument(<div hidden="false" />, cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Received the string `%s` for the boolean attribute `%s`. ' +
        '%s ' +
        'Did you mean %s={%s}?',
        'false',
        'hidden',
        "The browser will interpret it as a truthy value.",
        'hidden',
        'false'
      );

      expect(el.getAttribute('hidden')).toBe('');
    });

    it('warns on the potentially-ambiguous string value "true"', function() {
      let el = ReactTestUtils.renderIntoDocument(<div hidden="true" />, cocoMvc);
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        "Received the string `%s` for the boolean attribute `%s`. %s Did you mean %s={%s}?",
        "true",
        "hidden",
        "Although this works, it will not work as expected if you pass the string \"false\".",
        "hidden",
        "true"
      );

      expect(el.getAttribute('hidden')).toBe('');
    });
  })

  describe('Hyphenated SVG elements', function() {
    it('the font-face element is not a custom element', function() {
      let el = ReactTestUtils.renderIntoDocument(
        <svg>
          <font-face x-height={false} />
        </svg>,
        cocoMvc
      );
      expect(consoleErrorSpy.mock.calls[1]).toEqual([
        "Invalid DOM property `%s`. Did you mean `%s`?", "x-height", "xHeight"
      ]);

      expect(el.querySelector('font-face').hasAttribute('x-height')).toBe(
        false,
      );
    });

    it('the font-face element does not allow unknown boolean values', function() {
      let el = ReactTestUtils.renderIntoDocument(
        <svg>
          <font-face whatever={false} />
        </svg>,
        cocoMvc
      );
      expect(consoleErrorSpy).toHaveBeenCalledWith(
        'Received `%s` for a non-boolean attribute `%s`.\n\n' +
        'If you want to write it to the DOM, pass a string instead: ' +
        '%s="%s" or %s={value.toString()}.\n\n' +
        'If you used to conditionally omit it with %s={condition && value}, ' +
        'pass %s={condition ? value : undefined} instead.',
        false, "whatever", "whatever", false, "whatever", "whatever", "whatever"
      );

      expect(el.querySelector('font-face').hasAttribute('whatever')).toBe(
        false,
      );
    });
  })

  describe('Custom elements', () => {
    it('does not strip unknown boolean attributes', () => {
      const container = document.createElement('div');
      cocoMvc.render(<some-custom-element foo={true} />, container);
      const node = container.firstChild;
      expect(node.getAttribute('foo')).toBe('true');
      cocoMvc.render(<some-custom-element foo={false} />, container);
      expect(node.getAttribute('foo')).toBe('false');
      cocoMvc.render(<some-custom-element />, container);
      expect(node.hasAttribute('foo')).toBe(false);
      cocoMvc.render(<some-custom-element foo={true} />, container);
      expect(node.hasAttribute('foo')).toBe(true);
    });

    it('does not strip the on* attributes', () => {
      const container = document.createElement('div');
      cocoMvc.render(<some-custom-element onx="bar" />, container);
      const node = container.firstChild;
      expect(node.getAttribute('onx')).toBe('bar');
      cocoMvc.render(<some-custom-element onx="buzz" />, container);
      expect(node.getAttribute('onx')).toBe('buzz');
      cocoMvc.render(<some-custom-element />, container);
      expect(node.hasAttribute('onx')).toBe(false);
      cocoMvc.render(<some-custom-element onx="bar" />, container);
      expect(node.getAttribute('onx')).toBe('bar');
    });
  })
})