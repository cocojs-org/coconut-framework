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
import { render, registerApplication, unregisterApplication } from '../index';
import * as ReactTestUtils from './test-units/ReactTestUnits';

let Application
let application
let view
describe('ReactDOMComponent', () => {
  beforeEach(async () => {
    Application = (await import('coco-mvc')).Application;
    view = (await import('coco-mvc')).view
    application = new Application();
    registerApplication(application);
  })

  afterEach(() => {
    unregisterApplication();
    jest.resetModules();
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
  })
})