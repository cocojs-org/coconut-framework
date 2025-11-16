/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 */

'use strict';

import * as ReactTestUtils from './test-units/ReactTestUnits';

describe('ReactDOMOption', () => {
    let cocoMvc;
    let Application;
    let application;
    let jsx;
    let view;
    let reactive;
    let ref;
    let consoleErrorSpy;

    beforeEach(async () => {
        jest.resetModules();

        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});

        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        view = cocoMvc.view;
        reactive = cocoMvc.reactive;
        ref = cocoMvc.ref;
        jsx = cocoMvc.jsx;
        application = new Application();
        cocoMvc.registerMvcApi(application);
    });
    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
        consoleErrorSpy.mockRestore();
    });

    it('should flatten children to a string', () => {
        const stub = (
            <option>
                {1} {'foo'}
            </option>
        );
        const node = ReactTestUtils.renderIntoDocument(stub, cocoMvc);

        expect(node.innerHTML).toBe('1 foo');
    });

    it('should warn for invalid child tags', () => {
        const el = (
            <option value="12">
                {1} <div /> {2}
            </option>
        );
        let node = ReactTestUtils.renderIntoDocument(el, cocoMvc);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'validateDOMNesting(...): %s cannot appear as a child of <%s>.%s%s',
            '<div>',
            'option',
            '',
            ''
        );
        expect(node.innerHTML).toBe('1 <div></div> 2');
        ReactTestUtils.renderIntoDocument(el, cocoMvc);
    });

    it('should warn for component child if no value prop is provided', () => {
        @view()
        class Foo {
            render() {
                return '2';
            }
        }
        application.start();
        const el = (
            <option>
                {1} <Foo /> {3}
            </option>
        );
        let node = ReactTestUtils.renderIntoDocument(el, cocoMvc);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Cannot infer the option value of complex children. ' +
                'Pass a `value` prop or use a plain string as children to <option>.'
        );
        expect(node.innerHTML).toBe('1 2 3');
        ReactTestUtils.renderIntoDocument(el, cocoMvc);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(1);
    });

    it('should not warn for component child if value prop is provided', () => {
        @view()
        class Foo {
            render() {
                return '2';
            }
        }
        application.start();
        const el = (
            <option value="123">
                {1} <Foo /> {3}
            </option>
        );
        const node = ReactTestUtils.renderIntoDocument(el, cocoMvc);
        expect(node.innerHTML).toBe('1 2 3');
        ReactTestUtils.renderIntoDocument(el, cocoMvc);
        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
    });

    it('should ignore null/undefined/false children without warning', () => {
        const stub = (
            <option>
                {1} {false}
                {true}
                {null}
                {undefined} {2}
            </option>
        );
        const node = ReactTestUtils.renderIntoDocument(stub, cocoMvc);

        expect(node.innerHTML).toBe('1  2');
        expect(consoleErrorSpy).toHaveBeenCalledTimes(0);
    });

    it('should throw on object children', () => {
        expect(() => {
            ReactTestUtils.renderIntoDocument(<option>{{}}</option>, cocoMvc);
        }).toThrow('Objects are not valid as a React child');
        expect(() => {
            ReactTestUtils.renderIntoDocument(<option>{[{}]}</option>, cocoMvc);
        }).toThrow('Objects are not valid as a React child');
        expect(() => {
            ReactTestUtils.renderIntoDocument(
                <option>
                    {{}}
                    <span />
                </option>,
                cocoMvc
            );
        }).toThrow('Objects are not valid as a React child');
        expect(() => {
            ReactTestUtils.renderIntoDocument(
                <option>
                    {'1'}
                    {{}}
                    {2}
                </option>,
                cocoMvc
            );
        }).toThrow('Objects are not valid as a React child');
    });

    it('should be able to use dangerouslySetInnerHTML on option', () => {
        const stub = <option dangerouslySetInnerHTML={{ __html: 'foobar' }} />;
        let node = ReactTestUtils.renderIntoDocument(stub, cocoMvc);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'Pass a `value` prop if you set dangerouslyInnerHTML so React knows ' + 'which value should be selected.'
        );

        expect(node.innerHTML).toBe('foobar');
    });

    it('should set attribute for empty value', () => {
        const container = document.createElement('div');
        const option = cocoMvc.renderIntoContainer(<option value="" />, container);
        expect(option.hasAttribute('value')).toBe(true);
        expect(option.getAttribute('value')).toBe('');

        cocoMvc.renderIntoContainer(<option value="lava" />, container);
        expect(option.hasAttribute('value')).toBe(true);
        expect(option.getAttribute('value')).toBe('lava');
    });

    it('should allow ignoring `value` on option', () => {
        const a = 'a';
        const stub = (
            <select value="giraffe" onChange={() => {}}>
                <option>monkey</option>
                <option>gir{a}ffe</option>
                <option>gorill{a}</option>
            </select>
        );
        const options = stub.props.children;
        const container = document.createElement('div');
        const node = cocoMvc.renderIntoContainer(stub, container);

        expect(node.selectedIndex).toBe(1);

        cocoMvc.renderIntoContainer(<select value="gorilla">{options}</select>, container);
        expect(node.selectedIndex).toEqual(2);
    });
});
