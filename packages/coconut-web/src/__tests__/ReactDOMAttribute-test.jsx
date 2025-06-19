/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 *
 * packages/react-dom/src/__tests__/ReactDOMAttribute-test.js
 */
import { render, registerApplication, unregisterApplication } from '../index';
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

    it('removes unknown attributes that were rendered but are now missing', () => {
      const el = document.createElement('div');
      render(<div unknown="something" />, el);
      expect(el.firstChild.getAttribute('unknown')).toBe('something');
      render(<div />, el);
      expect(el.firstChild.hasAttribute('unknown')).toBe(false);
    });

    it('passes through strings', () => {
      testUnknownAttributeAssignment('a string', 'a string');
    });

    it('coerces numbers to strings', () => {
      testUnknownAttributeAssignment(0, '0');
      testUnknownAttributeAssignment(-1, '-1');
      testUnknownAttributeAssignment(42, '42');
      testUnknownAttributeAssignment(9000.99, '9000.99');
    });

    it('coerces NaN to strings and warns', () => {
      testUnknownAttributeAssignment(NaN, 'NaN')
    });

    it('coerces objects to strings and warns', () => {
      const lol = {
        toString() {
          return 'lol';
        },
      };

      testUnknownAttributeAssignment({hello: 'world'}, '[object Object]');
      testUnknownAttributeAssignment(lol, 'lol');
    });

    xit('throws with Temporal-like objects', () => {
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
      const test = () =>
        testUnknownAttributeAssignment(new TemporalLike(), null);
      expect(() =>
        expect(test).toThrowError(new TypeError('prod message')),
      ).toErrorDev(
        'Warning: The provided `unknown` attribute is an unsupported type TemporalLike.' +
        ' This value must be coerced to a string before before using it here.',
      );
    });

    it('removes symbols and warns', () => {
      testUnknownAttributeRemoval(Symbol('foo'))
    });

    it('removes functions and warns', () => {
      testUnknownAttributeRemoval(function someFunction() {})
    });

    it('allows camelCase unknown attributes and warns', () => {
      const el = document.createElement('div');

      render(<div helloWorld="something" />, el)

      expect(el.firstChild.getAttribute('helloworld')).toBe('something');
    });
  })
})