// packages/react-dom/src/__tests__/ReactDOM-test.js
/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */
import { render, registerApplication, unregisterApplication } from '../index';
import { getByRole, getByText, getRoles, waitFor } from '@testing-library/dom';
import * as ReactTestUtils from './test-units/ReactTestUnits';

let Application
let application
let view
describe('ReactDOM unknown attribute', () => {
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

  function testUnknownAttributeRemoval(givenValue) {
    const el = document.createElement('div');
    render(<div unknown="something" />, el);
    expect(el.firstChild.getAttribute('unknown')).toBe('something');
    render(<div unknown={givenValue} />, el);
    expect(el.firstChild.hasAttribute('unknown')).toBe(false);
  }

  function testUnknownAttributeAssignment(givenValue, expectedDOMValue) {
    const el = document.createElement('div');
    render(<div unknown="something" />, el);
    expect(el.firstChild.getAttribute('unknown')).toBe('something');
    render(<div unknown={givenValue} />, el);
    expect(el.firstChild.getAttribute('unknown')).toBe(expectedDOMValue);
  }

  describe('unknown attributes', () => {
    it('removes values null and undefined', () => {
      testUnknownAttributeRemoval(null);
      testUnknownAttributeRemoval(undefined);
    });

    it('changes values true, false to null, and also warns once', () => {
      testUnknownAttributeAssignment(true, null);
      testUnknownAttributeAssignment(false, null);
    })
  })
})