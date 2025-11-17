/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 *
 * packages/react-dom/src/__tests__/ReactDOM-test.js
 */
import { getByRole, getByText, getRoles, waitFor } from '@testing-library/dom';
import * as ReactTestUtils from './test-units/ReactTestUnits';

describe('ReactDOM', () => {
    let cocoMvc;
    let Application;
    let application;
    let view;
    beforeEach(async () => {
        cocoMvc = await import('@cocojs/mvc');
        Application = cocoMvc.Application;
        view = cocoMvc.view;
        application = new Application();
        cocoMvc.registerMvcApi(application);
    });

    afterEach(() => {
        cocoMvc.unregisterMvcApi();
        application.destructor();
        jest.resetModules();
    });

    it('should bubble onSubmit', async () => {
        const container = document.createElement('p');
        let count = 0;
        let buttonRef;

        @view()
        class Parent {
            render() {
                return (
                    <div
                        onSubmit={(event) => {
                            // event.preventDefault();
                            count++;
                        }}
                    >
                        <Child />
                    </div>
                );
            }
        }

        @view()
        class Child {
            render() {
                return (
                    <form role={'form'}>
                        <input
                            type="submit"
                            ref={(button) => {
                                buttonRef = button;
                            }}
                        />
                    </form>
                );
            }
        }

        application.start();
        document.body.appendChild(container);
        try {
            cocoMvc.renderIntoContainer(<Parent />, container);
            // todo jsdom没有实现requestSubmit，这里先不然form执行默认操作
            // 否则报Error: Not implemented: HTMLFormElement.prototype.requestSubmit
            const form = getByRole(container, 'form');
            form.addEventListener('submit', (e) => {
                e.preventDefault();
            });
            expect(buttonRef).toBeTruthy();
            buttonRef.click();
            expect(count).toBe(1);
        } finally {
            document.body.removeChild(container);
        }
    });

    it('allows a DOM element to be used with a string', () => {
        application.start();
        const element = <div className={'foo'} />;
        const node = ReactTestUtils.renderIntoDocument(element, cocoMvc);
        expect(node.tagName).toBe('DIV');
    });

    it('should allow children to be passed as an argument', () => {
        const argNode = ReactTestUtils.renderIntoDocument(<div>child</div>, cocoMvc);
        expect(argNode.innerHTML).toBe('child');
    });

    it('should overwrite props.children with children argument', () => {
        const conflictNode = ReactTestUtils.renderIntoDocument(<div children="fakechild">child</div>, cocoMvc);
        expect(conflictNode.innerHTML).toBe('child');
    });

    /**
     * We need to make sure that updates occur to the actual node that's in the
     * DOM, instead of a stale cache.
     */
    it('should purge the DOM cache when removing nodes', () => {
        let myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theDog" className="dog" />,
                <div key="theBird" className="bird" />
            </div>,
            cocoMvc
        );
        // Warm the cache with theDog
        myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theDog" className="dogbeforedelete" />,
                <div key="theBird" className="bird" />,
            </div>,
            cocoMvc
        );
        // Remove theDog - this should purge the cache
        myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theBird" className="bird" />,
            </div>,
            cocoMvc
        );
        // Now, put theDog back. It's now a different DOM node.
        myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theDog" className="dog" />,
                <div key="theBird" className="bird" />,
            </div>,
            cocoMvc
        );
        // Change the className of theDog. It will use the same element
        myDiv = ReactTestUtils.renderIntoDocument(
            <div>
                <div key="theDog" className="bigdog" />,
                <div key="theBird" className="bird" />,
            </div>,
            cocoMvc
        );
        const dog = myDiv.childNodes[0];
        expect(dog.className).toBe('bigdog');
    });

    // todo 没有支持更新后恢复focus的功能
    xit('preserves focus', () => {
        let input;
        let input2;

        @view()
        class A {
            props;
            render() {
                return (
                    <div>
                        <input id="one" ref={(r) => (input = input || r)} />
                        {this.props.showTwo && <input id="two" ref={(r) => (input2 = input2 || r)} />}
                    </div>
                );
            }

            viewDidUpdate() {
                // Focus should have been restored to the original input
                expect(document.activeElement.id).toBe('one');
                input2.focus();
                expect(document.activeElement.id).toBe('two');
                log.push('input2 focused');
            }
        }

        application.start();
        const log = [];
        const container = document.createElement('div');
        document.body.appendChild(container);
        try {
            cocoMvc.renderIntoContainer(<A showTwo={false} />, container);
            input.focus();

            // When the second input is added, let's simulate losing focus, which is
            // something that could happen when manipulating DOM nodes (but is hard to
            // deterministically force without relying intensely on React DOM
            // implementation details)
            const div = container.firstChild;
            ['appendChild', 'insertBefore'].forEach((name) => {
                const mutator = div[name];
                div[name] = function () {
                    if (input) {
                        input.blur();
                        expect(document.activeElement.tagName).toBe('BODY');
                        log.push('input2 inserted');
                    }
                    return mutator.apply(this, arguments);
                };
            });

            expect(document.activeElement.id).toBe('one');
            cocoMvc.renderIntoContainer(<A showTwo={true} />, container);
            // input2 gets added, which causes input to get blurred. Then
            // componentDidUpdate focuses input2 and that should make it down to here,
            // not get overwritten by focus restoration.
            expect(document.activeElement.id).toBe('two');
            expect(log).toEqual(['input2 inserted', 'input2 focused']);
        } finally {
            document.body.removeChild(container);
        }
    });

    it('calls focus() on autoFocus elements after they have been mounted to the DOM', () => {
        const originalFocus = HTMLElement.prototype.focus;

        try {
            let focusedElement;
            let inputFocusedAfterMount = false;

            // This test needs to determine that focus is called after mount.
            // Can't check document.activeElement because PhantomJS is too permissive;
            // It doesn't require element to be in the DOM to be focused.
            HTMLElement.prototype.focus = function () {
                focusedElement = this;
                inputFocusedAfterMount = !!this.parentNode;
            };

            const container = document.createElement('div');
            document.body.appendChild(container);
            cocoMvc.renderIntoContainer(
                <div>
                    <h1>Auto-focus Test</h1>
                    <input autoFocus={true} />
                    <p>The above input should be focused after mount.</p>
                </div>,
                container
            );

            expect(inputFocusedAfterMount).toBe(true);
            expect(focusedElement.tagName).toBe('INPUT');
        } finally {
            HTMLElement.prototype.focus = originalFocus;
        }
    });

    it("shouldn't fire duplicate event handler while handling other nested dispatch", () => {
        const actual = [];

        @view()
        class Wrapper {
            viewDidMount() {
                this.ref1.click();
            }

            render() {
                return (
                    <div>
                        <div
                            onClick={() => {
                                actual.push('1st node clicked');
                                this.ref2.click();
                            }}
                            ref={(ref) => (this.ref1 = ref)}
                        />
                        <div
                            onClick={(ref) => {
                                actual.push("2nd node clicked imperatively from 1st's handler");
                            }}
                            ref={(ref) => (this.ref2 = ref)}
                        />
                    </div>
                );
            }
        }

        application.start();
        const container = document.createElement('div');
        document.body.appendChild(container);
        try {
            cocoMvc.renderIntoContainer(<Wrapper />, container);

            const expected = ['1st node clicked', "2nd node clicked imperatively from 1st's handler"];

            expect(actual).toEqual(expected);
        } finally {
            document.body.removeChild(container);
        }
    });
});
