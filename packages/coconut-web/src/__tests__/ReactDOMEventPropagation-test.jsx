/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * packages/react-dom/src/__tests__/ReactDOMEventPropagation-test.js
 */

'use strict';


describe('ReactDOMEventListener', () => {
  let cocoMvc, Application, application, jsx, view, reactive, ref, container;

  beforeEach(async () => {
    cocoMvc = (await import('coco-mvc'));
    Application = (await import('coco-mvc')).Application;
    view = (await import('coco-mvc')).view;
    reactive = (await import('coco-mvc')).reactive;
    ref = (await import('coco-mvc')).ref;
    jsx = (await import('coco-mvc/jsx-runtime')).jsx;
    application = new Application();
    cocoMvc.registerApplication(application);
  })
  afterEach(() => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  })

  function cleanup() {
    if (container) {
      cocoMvc.unmountComponentAtNode(container);
      document.body.removeChild(container);
      container = null;
    }
  }
  function render(props) {
    cleanup();

    @view()
    class Fixture{
      props;

      render() {
        return (
          <Outer
            outerRef={this.props.outerRef}
            outerProps={this.props.outerProps}
            outerParentRef={this.props.outerParentRef}
            outerParentProps={this.props.outerParentProps}
          >
            <NestedReact>
              <Inner
                type={this.props.type}
                targetRef={this.props.targetRef}
                targetProps={this.props.targetProps}
                parentRef={this.props.parentRef}
                parentProps={this.props.parentProps}
              />
            </NestedReact>
          </Outer>
        );
      }
    }

    @view()
    class NestedReact {
      props;
      innerContainer;

      @ref()
      ref;

      viewDidMount = () => {
        this.innerContainer = document.createElement('div');
        this.ref.current.appendChild(this.innerContainer);
        cocoMvc.render(this.props.children, this.innerContainer);
      }

      viewWillUnmount = () => {
        cocoMvc.unmountComponentAtNode(this.innerContainer);
        this.ref.current.removeChild(this.innerContainer);
      }

      render() {
        return <div ref={this.ref} />;
      }
    }

    @view()
    class Inner {
      props;

      render() {
        return (
          <div {...this.props.parentProps} ref={this.props.parentRef}>
            <this.props.type {...this.props.targetProps} ref={this.props.targetRef} />
          </div>
        );
      }
    }

    @view()
    class Outer {
      props;

      render() {
        return (
          <div {...this.props.outerParentProps} ref={this.props.outerParentRef}>
            <div {...this.props.outerProps} ref={this.props.outerRef}>
              {this.props.children}
            </div>
          </div>
        );
      }
    }

    application.start();
    container = document.createElement('div');
    document.body.appendChild(container);
    cocoMvc.render(<Fixture {...props} />, container);
  }

  describe('bubbling events', () => {
    // This test will fail in legacy mode (only used in WWW)
    // because we emulate the React 16 behavior where
    // the click handler is attached to the document.
    // @gate !enableLegacyFBSupport
    it('onClick', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onClick',
        reactEventType: 'click',
        nativeEvent: 'click',
        dispatch(node) {
          node.click();
        },
      });
    });
  })

  // Events that bubble in React and in the browser.
  // React delegates them to the root.
  function testNativeBubblingEvent(config) {
    testNativeBubblingEventWithTargetListener(config);
    // testNativeBubblingEventWithoutTargetListener(config);
    // testReactStopPropagationInOuterCapturePhase(config);
    // testReactStopPropagationInInnerCapturePhase(config);
    // testReactStopPropagationInInnerBubblePhase(config);
    // testReactStopPropagationInOuterBubblePhase(config);
    // testNativeStopPropagationInOuterCapturePhase(config);
    // testNativeStopPropagationInInnerCapturePhase(config);
    // testNativeStopPropagationInInnerBubblePhase(config);
    // testNativeStopPropagationInOuterBubblePhase(config);
  }

  function testNativeBubblingEventWithTargetListener(eventConfig) {
    const log = [];
    const targetRef = {current: null};
    render(
      {
        type: eventConfig.type,
        targetRef: targetRef,
        targetProps: {
          [eventConfig.reactEvent]: e => {
            log.push('---- inner');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('---- inner capture');
          },
        },
        parentProps: {
          [eventConfig.reactEvent]: e => {
            log.push('--- inner parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('--- inner parent capture');
          },
        },
        outerProps: {
          [eventConfig.reactEvent]: e => {
            log.push('-- outer');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('-- outer capture');
          },
        },
        outerParentProps: {
          [eventConfig.reactEvent]: e => {
            log.push('- outer parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            expect(e.type).toBe(eventConfig.reactEventType);
            log.push('- outer parent capture');
          },
        },
      }
      );
    expect(log.length).toBe(0);
    eventConfig.dispatch(targetRef.current);
    // Should print all listeners.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
      --- inner parent capture
      ---- inner capture
      ---- inner
      --- inner parent
      -- outer
      - outer parent
    `);
  }

  function unindent(str) {
    return str[0]
      .split('\n')
      .map(s => s.trim())
      .filter(s => s !== '');
  }
})