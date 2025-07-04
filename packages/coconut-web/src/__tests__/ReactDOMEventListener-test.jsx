/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 *
 * packages/react-dom/src/__tests__/ReactDOMEventListener-test.js
 */

'use strict';

// todo 都从jsx里面导出吧，不然要维护2套alias，而且还要清缓存
import { render, unmountComponentAtNode, findDOMNode, registerApplication, unregisterApplication, cleanCache } from '../index';
import * as ReactTestUtils from './test-units/ReactTestUnits';

let Application
let application
let jsx
let view
let consoleErrorSpy
let consoleLogSpy

describe('ReactDOMEventListener', () => {
  beforeEach(async () => {
    Application = (await import('coco-mvc')).Application;
    view = (await import('coco-mvc')).view
    jsx = (await import('coco-mvc/jsx-runtime')).jsx;
    application = new Application();
    registerApplication(application);
    consoleErrorSpy = jest.spyOn(console, 'error');
    consoleErrorSpy.mockImplementation(() => {})
    consoleLogSpy = jest.spyOn(console, 'log');
    consoleLogSpy.mockImplementation(() => {})
  })

  afterEach(() => {
    cleanCache();
    unregisterApplication();
    jest.resetModules();
    consoleErrorSpy.mockRestore();
    consoleLogSpy.mockRestore();
  })

  describe('Propagation', () => {
    it('should propagate events one level down', () => {
      const mouseOut = jest.fn();
      const onMouseOut = event => mouseOut(event.currentTarget);

      const childContainer = document.createElement('div');
      const parentContainer = document.createElement('div');
      const childNode = render(
        <div onMouseOut={onMouseOut}>Child</div>,
        childContainer,
      );
      const parentNode = render(
        <div onMouseOut={onMouseOut}>div</div>,
        parentContainer,
      );
      parentNode.appendChild(childContainer);
      document.body.appendChild(parentContainer);

      try {
        const nativeEvent = document.createEvent('Event');
        nativeEvent.initEvent('mouseout', true, true);
        childNode.dispatchEvent(nativeEvent);

        expect(mouseOut).toBeCalled();
        expect(mouseOut).toHaveBeenCalledTimes(2);
        expect(mouseOut.mock.calls[0][0]).toEqual(childNode);
        expect(mouseOut.mock.calls[1][0]).toEqual(parentNode);
      } finally {
        document.body.removeChild(parentContainer);
      }
    });
  })
})

