/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @emails react-core
 *
 */
'use strict';

import * as ReactTestUtils from './test-units/ReactTestUnits';

let cocoMvc;
let Application;
let application;
let jsx;
let reactive;
let view;
let consoleErrorSpy;
let consoleLogSpy;

const clone = function (o) {
    return JSON.parse(JSON.stringify(o));
};

const GET_INIT_STATE_RETURN_VAL = {
    // hasWillMountCompleted: false, // coco没有componentWillMount生命周期方法
    hasRenderCompleted: false,
    hasDidMountCompleted: false,
    hasWillUnmountCompleted: false,
};
const INIT_RENDER_STATE = {
    // hasWillMountCompleted: true,
    hasRenderCompleted: false,
    hasDidMountCompleted: false,
    hasWillUnmountCompleted: false,
};
const DID_MOUNT_STATE = {
    // hasWillMountCompleted: true,
    hasRenderCompleted: true,
    hasDidMountCompleted: false,
    hasWillUnmountCompleted: false,
};
const NEXT_RENDER_STATE = {
    // hasWillMountCompleted: true,
    hasRenderCompleted: true,
    hasDidMountCompleted: true,
    hasWillUnmountCompleted: false,
};
const WILL_UNMOUNT_STATE = {
    // hasWillMountCompleted: true,
    hasDidMountCompleted: true,
    hasRenderCompleted: true,
    hasWillUnmountCompleted: false,
};
const POST_WILL_UNMOUNT_STATE = {
    // hasWillMountCompleted: true,
    hasDidMountCompleted: true,
    hasRenderCompleted: true,
    hasWillUnmountCompleted: true,
};
function getLifeCycleState(instance) {
    return instance?.updater?.isMounted(instance) ? 'MOUNTED' : 'UNMOUNTED';
}

describe('ReactDOMComponent', () => {
    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        Application = cocoMvc.Application;
        view = cocoMvc.view;
        jsx = cocoMvc.jsx;
        reactive = cocoMvc.reactive;
        application = new Application();
        cocoMvc.registerMvcApi(application);
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
        consoleLogSpy = jest.spyOn(console, 'log');
        consoleLogSpy.mockImplementation(() => {});
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        application.destructor();
        jest.resetModules();
        consoleErrorSpy.mockRestore();
        consoleLogSpy.mockRestore();
    });

    it('should not reuse an instance when it has been unmounted', () => {
        const container = document.createElement('div');

        @view()
        class StatefulComponent {
            state = {};

            render() {
                return <div />;
            }
        }

        application.start();
        const element = <StatefulComponent />;
        const firstInstance = cocoMvc.renderIntoContainer(element, container);
        cocoMvc.unmountComponentAtNode(container);
        const secondInstance = cocoMvc.renderIntoContainer(element, container);
        expect(firstInstance).not.toBe(secondInstance);
    });

    /**
     * If a state update triggers rerendering that in turn fires an onDOMReady,
     * that second onDOMReady should not fail.
     */
    it('it should fire onDOMReady when already in onDOMReady', () => {
        const _testJournal = [];

        @view()
        class Child {
            viewDidMount() {
                _testJournal.push('Child:onDOMReady');
            }

            render() {
                return <div />;
            }
        }

        @view()
        class SwitcherParent {
            @reactive()
            showHasOnDOMReadyComponent;

            constructor(props) {
                this.props = props;
                _testJournal.push('SwitcherParent:getInitialState');
                this.showHasOnDOMReadyComponent = false;
            }

            viewDidMount() {
                _testJournal.push('SwitcherParent:onDOMReady');
                this.switchIt();
            }

            switchIt = () => {
                this.showHasOnDOMReadyComponent = true;
            };

            render() {
                return <div>{this.showHasOnDOMReadyComponent ? <Child /> : <div />}</div>;
            }
        }

        application.start();
        ReactTestUtils.renderIntoDocument(<SwitcherParent />, cocoMvc);
        expect(_testJournal).toEqual([
            'SwitcherParent:getInitialState', // todo 因为组件会初始化实例化一次，react库中是没有这行的
            'SwitcherParent:getInitialState',
            'SwitcherParent:onDOMReady',
            'Child:onDOMReady',
        ]);
    });

    it("warns if setting 'this.state = props'", () => {
        @view()
        class StatefulComponent {
            @reactive()
            field = true;

            constructor(props) {
                this.field = props;
            }
            render() {
                return <div />;
            }
        }

        application.start();
        ReactTestUtils.renderIntoDocument(<StatefulComponent />, cocoMvc);
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            '%s: It is not recommended to assign props directly to state ' +
                "because updates to props won't be reflected in state. " +
                'In most cases, it is better to use props directly.',
            'StatefulComponent'
        );
    });

    it('should correctly determine if a component is mounted', () => {
        @view()
        class Component {
            _isMounted() {
                // No longer a public API, but we can test that it works internally by
                // reaching into the updater.
                return this.updater.isMounted(this);
            }
            componentDidMount() {
                expect(this._isMounted()).toBeTruthy();
            }
            render() {
                expect(this._isMounted()).toBeFalsy();
                return <div />;
            }
        }

        application.start();
        const element = <Component />;

        const instance = ReactTestUtils.renderIntoDocument(element, cocoMvc);
        expect(instance._isMounted()).toBeTruthy();
    });

    it('should correctly determine if a null component is mounted', () => {
        @view()
        class Component {
            _isMounted() {
                // No longer a public API, but we can test that it works internally by
                // reaching into the updater.
                return this.updater.isMounted(this);
            }
            viewDidMount() {
                expect(this._isMounted()).toBeTruthy();
            }
            render() {
                expect(this._isMounted()).toBeFalsy();
                return null;
            }
        }

        application.start();
        const element = <Component />;

        const instance = ReactTestUtils.renderIntoDocument(element, cocoMvc);
        expect(instance._isMounted()).toBeTruthy();
    });

    it('isMounted should return false when unmounted', () => {
        @view()
        class Component {
            render() {
                return <div />;
            }
        }

        application.start();
        const container = document.createElement('div');
        const instance = cocoMvc.renderIntoContainer(<Component />, container);

        // No longer a public API, but we can test that it works internally by
        // reaching into the updater.
        expect(instance.updater.isMounted(instance)).toBe(true);

        cocoMvc.unmountComponentAtNode(container);

        expect(instance.updater.isMounted(instance)).toBe(false);
    });

    it('should carry through each of the phases of setup', () => {
        @view()
        class LifeCycleComponent {
            @reactive()
            state;

            constructor(props, context) {
                this._testJournal = {};
                const initState = {
                    hasDidMountCompleted: false,
                    hasRenderCompleted: false,
                    hasWillUnmountCompleted: false,
                };
                this._testJournal.returnedFromGetInitialState = clone(initState);
                this._testJournal.lifeCycleAtStartOfGetInitialState = getLifeCycleState(this);
                this.state = initState;
            }

            viewDidMount() {
                this._testJournal.stateAtStartOfDidMount = clone(this.state);
                this._testJournal.lifeCycleAtStartOfDidMount = getLifeCycleState(this);
                this.state.hasDidMountCompleted = true;
            }

            render() {
                const isInitialRender = !this.state.hasRenderCompleted;
                if (isInitialRender) {
                    this._testJournal.stateInInitialRender = clone(this.state);
                    this._testJournal.lifeCycleInInitialRender = getLifeCycleState(this);
                } else {
                    this._testJournal.stateInLaterRender = clone(this.state);
                    this._testJournal.lifeCycleInLaterRender = getLifeCycleState(this);
                }
                // you would *NEVER* do anything like this in real code!
                this.state.hasRenderCompleted = true;
                return <div>I am the inner DIV</div>;
            }

            viewWillUnmount() {
                this._testJournal.stateAtStartOfWillUnmount = clone(this.state);
                this._testJournal.lifeCycleAtStartOfWillUnmount = getLifeCycleState(this);
                this.state.hasWillUnmountCompleted = true;
            }
        }

        // A component that is merely "constructed" (as in "constructor") but not
        // yet initialized, or rendered.
        //
        application.start();
        const container = document.createElement('div');
        let instance = cocoMvc.renderIntoContainer(<LifeCycleComponent />, container);
        // getInitialState
        expect(instance._testJournal.returnedFromGetInitialState).toEqual(GET_INIT_STATE_RETURN_VAL);
        expect(instance._testJournal.lifeCycleAtStartOfGetInitialState).toBe('UNMOUNTED');

        // viewDidMount
        expect(instance._testJournal.stateAtStartOfDidMount).toEqual(DID_MOUNT_STATE);
        expect(instance._testJournal.lifeCycleAtStartOfDidMount).toBe('MOUNTED');

        // initial render
        expect(instance._testJournal.stateInInitialRender).toEqual(INIT_RENDER_STATE);
        expect(instance._testJournal.lifeCycleInInitialRender).toBe('UNMOUNTED');

        // Now *update the component* // coco 没有forceupdate，所以使用render代替
        instance = cocoMvc.renderIntoContainer(<LifeCycleComponent />, container);

        // render 2nd time
        expect(instance._testJournal.stateInLaterRender).toEqual(NEXT_RENDER_STATE);
        expect(instance._testJournal.lifeCycleInLaterRender).toBe('MOUNTED');

        expect(getLifeCycleState(instance)).toBe('MOUNTED');

        cocoMvc.unmountComponentAtNode(container);

        expect(instance._testJournal.stateAtStartOfWillUnmount).toEqual(WILL_UNMOUNT_STATE);
        // componentWillUnmount called right before unmount.
        expect(instance._testJournal.lifeCycleAtStartOfWillUnmount).toBe('MOUNTED');

        // But the current lifecycle of the component is unmounted.
        expect(getLifeCycleState(instance)).toBe('UNMOUNTED');
        expect(instance.state).toEqual(POST_WILL_UNMOUNT_STATE);
    });

    it('should not throw when updating an auxiliary component', () => {
        @view()
        class Tooltip {
            props;
            render() {
                return <div>{this.props.children}</div>;
            }

            viewDidMount() {
                this.container = document.createElement('div');
                this.updateTooltip();
            }

            viewDidUpdate() {
                this.updateTooltip();
            }

            updateTooltip = () => {
                // Even though this.props.tooltip has an owner, updating it shouldn't
                // throw here because it's mounted as a root component
                cocoMvc.renderIntoContainer(this.props.tooltip, this.container);
            };
        }

        @view()
        class Component {
            render() {
                return <Tooltip tooltip={<div>{this.props.tooltipText}</div>}>{this.props.text}</Tooltip>;
            }
        }

        application.start();
        const container = document.createElement('div');
        cocoMvc.renderIntoContainer(<Component text="uno" tooltipText="one" />, container);

        // Since `instance` is a root component, we can set its props. This also
        // makes Tooltip rerender the tooltip component, which shouldn't throw.
        cocoMvc.renderIntoContainer(<Component text="dos" tooltipText="two" />, container);
    });

    it('should allow state updates in viewDidMount', () => {
        /**
         * calls setState in an componentDidMount.
         */
        @view()
        class SetStateInComponentDidMount {
            props;

            @reactive()
            stateField;

            constructor(props) {
                this.stateField = props?.valueToUseInitially;
            }

            viewDidMount() {
                this.stateField = this.props.valueToUseInOnDOMReady;
            }

            render() {
                return <div />;
            }
        }

        application.start();
        let instance = ReactTestUtils.renderIntoDocument(
            <SetStateInComponentDidMount valueToUseInitially="hello" valueToUseInOnDOMReady="goodbye" />,
            cocoMvc
        );
        expect(instance.stateField).toBe('goodbye');
    });

    it('should call nested legacy lifecycle methods in the right order', () => {
        let log;
        const logger = function (msg) {
            return function () {
                // return true for shouldComponentUpdate
                log.push(msg);
                return true;
            };
        };
        @view()
        class Outer {
            props;
            viewDidMount = logger('outer viewDidMount');
            viewDidUpdate = logger('outer viewDidUpdate');
            viewWillUnmount = logger('outer viewWillUnmount');
            render() {
                return (
                    <div>
                        <Inner x={this.props.x} />
                    </div>
                );
            }
        }

        @view()
        class Inner {
            props;
            viewDidMount = logger('inner viewDidMount');
            viewDidUpdate = logger('inner viewDidUpdate');
            viewWillUnmount = logger('inner viewWillUnmount');
            render() {
                return <span>{this.props.x}</span>;
            }
        }

        application.start();
        const container = document.createElement('div');
        log = [];
        cocoMvc.renderIntoContainer(<Outer x={1} />, container);
        expect(log).toEqual(['inner viewDidMount', 'outer viewDidMount']);

        // Dedup warnings
        log = [];
        cocoMvc.renderIntoContainer(<Outer x={2} />, container);
        expect(log).toEqual(['inner viewDidUpdate', 'outer viewDidUpdate']);

        log = [];
        cocoMvc.unmountComponentAtNode(container);
        expect(log).toEqual(['outer viewWillUnmount', 'inner viewWillUnmount']);
    });
});
