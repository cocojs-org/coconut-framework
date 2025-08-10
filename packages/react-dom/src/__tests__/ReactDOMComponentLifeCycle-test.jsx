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

let cocoMvc
let Application
let application
let jsx
let reactive
let view
let consoleErrorSpy
let consoleLogSpy
describe('ReactDOMComponent', () => {
  beforeEach(async () => {
    cocoMvc = (await import('coco-mvc'));
    Application = cocoMvc.Application;
    view = cocoMvc.view
    jsx = cocoMvc.jsx;
    reactive = cocoMvc.reactive;
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
    const firstInstance = cocoMvc.render(element, container);
    cocoMvc.unmountComponentAtNode(container);
    const secondInstance = cocoMvc.render(element, container);
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
        this.showHasOnDOMReadyComponent = false
      }

      viewDidMount() {
        _testJournal.push('SwitcherParent:onDOMReady');
        this.switchIt();
      }

      switchIt = () => {
        this.showHasOnDOMReadyComponent = true;
      };

      render() {
        return (
          <div>
            {this.showHasOnDOMReadyComponent ? <Child /> : <div />}
          </div>
        );
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
    )
  });
})