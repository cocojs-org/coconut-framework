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

import { render, registerApplication, unregisterApplication } from '../index';
import * as ReactTestUtils from './test-units/ReactTestUnits';

let Application
let application
let view
let consoleSpy
describe('ReactDOMComponent', () => {
  beforeEach(async () => {
    Application = (await import('coco-mvc')).Application;
    view = (await import('coco-mvc')).view
    application = new Application();
    registerApplication(application);
    consoleSpy = jest.spyOn(console, 'error');
    consoleSpy.mockImplementation(() => {})
  })

  afterEach(() => {
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
  })
})