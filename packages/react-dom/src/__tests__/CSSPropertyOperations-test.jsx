/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 *
 * packages/react-dom/src/__tests__/CSSPropertyOperations-test.js
 */
import { getByRole, getByText, getRoles, waitFor } from '@testing-library/dom';
import * as ReactTestUtils from './test-units/ReactTestUnits';

let cocoMvc;
let Application
let application
let view
let consoleErrorSpy;
describe('CSSPropertyOperations', () => {
  beforeEach(async () => {
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {})

    cocoMvc = (await import('coco-mvc'));
    Application = cocoMvc.Application;
    view = cocoMvc.view
    application = new Application();
    cocoMvc.registerMvcApi(application);
  })

  afterEach(() => {
    cocoMvc.unregisterMvcApi();
    jest.resetModules();
    application.destructor();
    consoleErrorSpy.mockRestore();
  })

  it('should automatically append `px` to relevant styles', () => {
    const styles = {
      left: 0,
      margin: 16,
      opacity: 0.5,
      padding: '4px',
    };
    const container = document.createElement('div');
    const node = cocoMvc.renderIntoContainer(<div style={styles} />, container);
    const style = node.getAttribute('style')
    expect(style).toContain('left: 0px; margin: 16px; opacity: 0.5; padding: 4px');
  });

  it('should trim values', () => {
    const styles = {
      left: '16 ',
      opacity: 0.5,
      right: ' 4 ',
    };
    const container = document.createElement('div');
    const node = cocoMvc.renderIntoContainer(<div style={styles} />, container);
    const style = node.getAttribute('style')
    expect(style).toContain('opacity: 0.5;');
  });

  it('should set style attribute when styles exist', () => {
    const styles = {
      backgroundColor: '#000',
      display: 'none',
    };
    let div = <div style={styles} />;
    const root = document.createElement('div');
    div = cocoMvc.renderIntoContainer(div, root);
    expect(/style=".*"/.test(root.innerHTML)).toBe(true);
  });

  it('should not set style attribute when no styles exist', () => {
    const styles = {
      backgroundColor: null,
      display: null,
    };
    let div = <div style={styles} />;
    const root = document.createElement('div');
    div = cocoMvc.renderIntoContainer(div, root);
    expect(/style=/.test(root.innerHTML)).toBe(false);
  });

  it('should warn when using hyphenated style names', () => {
    @view()
    class Comp {
      static displayName = 'Comp';

      render() {
        return <div style={{'background-color': 'crimson'}} />;
      }
    }

    application.start();
    const root = document.createElement('div');
    cocoMvc.renderIntoContainer(<Comp />, root);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      'Unsupported style property %s. Did you mean %s?',
      'background-color',
      'backgroundColor'
    );
  });

  it('should warn when updating hyphenated style names', () => {
    @view()
    class Comp {
      constructor(props) {
        this.props = props;
      }
      static displayName = 'Comp';

      render() {
        return <div style={this.props.style} />;
      }
    }

    const styles = {
      '-ms-transform': 'translate3d(0, 0, 0)',
      '-webkit-transform': 'translate3d(0, 0, 0)',
    };
    application.start();
    const root = document.createElement('div');
    cocoMvc.renderIntoContainer(<Comp style={styles} />, root)
    expect(consoleErrorSpy.mock.calls[0]).toEqual([
      'Unsupported style property %s. Did you mean %s?',
      '-ms-transform',
      'msTransform'
    ]);
    expect(consoleErrorSpy.mock.calls[1]).toEqual([
      'Unsupported style property %s. Did you mean %s?',
      '-webkit-transform',
      'WebkitTransform'
    ]);
  });

  it('warns when miscapitalizing vendored style names', () => {
    @view()
    class Comp {
      static displayName = 'Comp';

      render() {
        return (
          <div
            style={{
              msTransform: 'translate3d(0, 0, 0)',
              oTransform: 'translate3d(0, 0, 0)',
              webkitTransform: 'translate3d(0, 0, 0)',
            }}
          />
        );
      }
    }

    application.start();
    const root = document.createElement('div');
    cocoMvc.renderIntoContainer(<Comp />, root)
    expect(consoleErrorSpy.mock.calls[0]).toEqual([
      'Unsupported vendor-prefixed style property %s. Did you mean %s?',
      'oTransform',
      'OTransform'
    ]);
    expect(consoleErrorSpy.mock.calls[1]).toEqual([
      'Unsupported vendor-prefixed style property %s. Did you mean %s?',
      'webkitTransform',
      'WebkitTransform'
    ]);
  });

  it('should warn about style having a trailing semicolon', () => {
    @view()
    class Comp {
      static displayName = 'Comp';

      render() {
        return (
          <div
            style={{
              fontFamily: 'Helvetica, arial',
              backgroundImage: 'url(foo;bar)',
              backgroundColor: 'blue;',
              color: 'red;   ',
            }}
          />
        );
      }
    }

    application.start();
    const root = document.createElement('div');
    cocoMvc.renderIntoContainer(<Comp />, root);
    expect(consoleErrorSpy.mock.calls[0]).toEqual([
      "Style property values shouldn't contain a semicolon. " +
      'Try "%s: %s" instead.',
      'backgroundColor',
      'blue'
    ]);
    expect(consoleErrorSpy.mock.calls[1]).toEqual([
      "Style property values shouldn't contain a semicolon. " +
      'Try "%s: %s" instead.',
      'color',
      'red'
    ]);
  });

  it('should warn about style containing a NaN value', () => {
    @view()
    class Comp {
      static displayName = 'Comp';

      render() {
        return <div style={{fontSize: NaN}} />;
      }
    }

    application.start();
    const root = document.createElement('div');
    cocoMvc.renderIntoContainer(<Comp />, root);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '`NaN` is an invalid value for the `%s` css style property.',
      'fontSize',
    );
  });

  it('should not warn when setting CSS custom properties', () => {
    @view()
    class Comp {
      render() {
        return <div style={{'--foo-primary': 'red', backgroundColor: 'red'}} />;
      }
    }

    application.start();
    const root = document.createElement('div');
    cocoMvc.renderIntoContainer(<Comp />, root);
  });

  it('should warn about style containing an Infinity value', () => {
    @view()
    class Comp {
      static displayName = 'Comp';

      render() {
        return <div style={{fontSize: 1 / 0}} />;
      }
    }

    application.start();
    const root = document.createElement('div');
    cocoMvc.renderIntoContainer(<Comp />, root);
    expect(consoleErrorSpy).toHaveBeenCalledWith(
      '`Infinity` is an invalid value for the `%s` css style property.',
      'fontSize',
    );
  });

  it('should not add units to CSS custom properties', () => {
    @view()
    class Comp {
      render() {
        return <div style={{'--foo': '5'}} />;
      }
    }

    application.start();
    const root = document.createElement('div');
    cocoMvc.renderIntoContainer(<Comp />, root);

    expect(root.children[0].style.getPropertyValue('--foo')).toEqual('5');
  });
})