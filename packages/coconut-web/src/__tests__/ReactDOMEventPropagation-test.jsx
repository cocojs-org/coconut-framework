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
  function render(tree) {
    cleanup();

    container = document.createElement('div');
    document.body.appendChild(container);
    cocoMvc.render(tree, container);
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
    testNativeBubblingEventWithTargetListener(config, Fixture);
    testNativeBubblingEventWithoutTargetListener(config, Fixture);
    testReactStopPropagationInOuterCapturePhase(config, Fixture);
    testReactStopPropagationInInnerCapturePhase(config, Fixture);
    testReactStopPropagationInInnerBubblePhase(config, Fixture);
    testReactStopPropagationInOuterBubblePhase(config, Fixture);
    testNativeStopPropagationInOuterCapturePhase(config, Fixture);
    testNativeStopPropagationInInnerCapturePhase(config, Fixture);
    testNativeStopPropagationInInnerBubblePhase(config, Fixture);
    testNativeStopPropagationInOuterBubblePhase(config, Fixture);
  }

  function testNativeBubblingEventWithTargetListener(eventConfig, Fixture) {
    const log = [];
    const targetRef = {current: null};
    render(<Fixture
        type={eventConfig.type}
        targetRef={targetRef}
        targetProps={{
          [eventConfig.reactEvent]: e => {
            log.push('---- inner');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('---- inner capture');
          },
        }}
        parentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('--- inner parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('--- inner parent capture');
          },
        }}
        outerProps={{
          [eventConfig.reactEvent]: e => {
            log.push('-- outer');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('-- outer capture');
          },
        }}
        outerParentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('- outer parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            expect(e.type).toBe(eventConfig.reactEventType);
            log.push('- outer parent capture');
          },
        }}
        />
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

  function testNativeBubblingEventWithoutTargetListener(eventConfig, Fixture) {
    const log = [];
    const targetRef = {current: null};
    render(
      <Fixture
        type={eventConfig.type}
        targetRef={targetRef}
        targetProps={
          {
            // No listener on the target itself.
          }
        }
        parentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('--- inner parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('--- inner parent capture');
          },
        }}
        outerProps={{
          [eventConfig.reactEvent]: e => {
            log.push('-- outer');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('-- outer capture');
          },
        }}
        outerParentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('- outer parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            expect(e.type).toBe(eventConfig.reactEventType);
            log.push('- outer parent capture');
          },
        }}
      />,
    );
    expect(log.length).toBe(0);
    eventConfig.dispatch(targetRef.current);
    // Should print all listeners except the innermost one.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
      --- inner parent capture
      --- inner parent
      -- outer
      - outer parent
    `);
  }

  function testReactStopPropagationInOuterCapturePhase(eventConfig, Fixture) {
    const log = [];
    const targetRef = {current: null};
    render(
      <Fixture
        type={eventConfig.type}
        targetRef={node => {
          targetRef.current = node;
          if (node) {
            // No cleanup, assume we render once.
            node.addEventListener(eventConfig.nativeEvent, e => {
              // We *don't* expect this to appear in the log
              // at all because the event is stopped earlier.
              log.push('---- inner (native)');
            });
          }
        }}
        targetProps={{
          [eventConfig.reactEvent]: e => {
            log.push('---- inner');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('---- inner capture');
          },
        }}
        parentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('--- inner parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('--- inner parent capture');
          },
        }}
        outerProps={{
          [eventConfig.reactEvent]: e => {
            log.push('-- outer');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            e.stopPropagation(); // <---------
            log.push('-- outer capture');
          },
        }}
        outerParentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('- outer parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            expect(e.type).toBe(eventConfig.reactEventType);
            log.push('- outer parent capture');
          },
        }}
      />,
    );
    expect(log.length).toBe(0);
    eventConfig.dispatch(targetRef.current);
    // Should stop at the outer capture.
    // We don't get to the inner root at all.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
    `);
  }

  function testReactStopPropagationInInnerCapturePhase(eventConfig, Fixture) {
    const log = [];
    const targetRef = {current: null};
    render(
      <Fixture
        type={eventConfig.type}
        targetRef={node => {
          targetRef.current = node;
          if (node) {
            // No cleanup, assume we render once.
            node.addEventListener(eventConfig.nativeEvent, e => {
              // We *don't* expect this to appear in the log
              // at all because the event is stopped earlier.
              log.push('---- inner (native)');
            });
          }
        }}
        targetProps={{
          [eventConfig.reactEvent]: e => {
            log.push('---- inner');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('---- inner capture');
          },
        }}
        parentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('--- inner parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            e.stopPropagation(); // <---------
            log.push('--- inner parent capture');
          },
        }}
        outerProps={{
          [eventConfig.reactEvent]: e => {
            log.push('-- outer');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('-- outer capture');
          },
        }}
        outerParentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('- outer parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            expect(e.type).toBe(eventConfig.reactEventType);
            log.push('- outer parent capture');
          },
        }}
      />,
    );
    expect(log.length).toBe(0);
    eventConfig.dispatch(targetRef.current);
    // We get to the inner root, but we don't
    // get to the target and we don't bubble.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
      --- inner parent capture
    `);
  }

  function testReactStopPropagationInInnerBubblePhase(eventConfig, Fixture) {
    const log = [];
    const targetRef = {current: null};
    render(
      <Fixture
        type={eventConfig.type}
        targetRef={targetRef}
        targetProps={{
          [eventConfig.reactEvent]: e => {
            e.stopPropagation(); // <---------
            log.push('---- inner');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('---- inner capture');
          },
        }}
        parentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('--- inner parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('--- inner parent capture');
          },
        }}
        outerRef={node => {
          if (node) {
            // No cleanup, assume we render once.
            node.addEventListener(eventConfig.nativeEvent, e => {
              // We *don't* expect this to appear in the log
              // at all because the event is stopped earlier.
              log.push('-- outer (native)');
            });
          }
        }}
        outerProps={{
          [eventConfig.reactEvent]: e => {
            log.push('-- outer');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('-- outer capture');
          },
        }}
        outerParentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('- outer parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            expect(e.type).toBe(eventConfig.reactEventType);
            log.push('- outer parent capture');
          },
        }}
      />,
    );
    expect(log.length).toBe(0);
    eventConfig.dispatch(targetRef.current);
    // Should stop at the target and not go further.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
      --- inner parent capture
      ---- inner capture
      ---- inner
    `);
  }

  function testReactStopPropagationInOuterBubblePhase(eventConfig, Fixture) {
    const log = [];
    const targetRef = {current: null};
    render(
      <Fixture
        type={eventConfig.type}
        targetRef={targetRef}
        targetProps={{
          [eventConfig.reactEvent]: e => {
            log.push('---- inner');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('---- inner capture');
          },
        }}
        parentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('--- inner parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('--- inner parent capture');
          },
        }}
        outerProps={{
          [eventConfig.reactEvent]: e => {
            e.stopPropagation(); // <---------
            log.push('-- outer');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('-- outer capture');
          },
        }}
        outerParentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('- outer parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            expect(e.type).toBe(eventConfig.reactEventType);
            log.push('- outer parent capture');
          },
        }}
      />,
    );
    expect(log.length).toBe(0);
    eventConfig.dispatch(targetRef.current);
    // Should not reach the parent outer bubble handler.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
      --- inner parent capture
      ---- inner capture
      ---- inner
      --- inner parent
      -- outer
    `);
  }

  function testNativeStopPropagationInOuterCapturePhase(eventConfig, Fixture) {
    const log = [];
    const targetRef = {current: null};
    render(
      <Fixture
        type={eventConfig.type}
        targetRef={targetRef}
        targetProps={{
          [eventConfig.reactEvent]: e => {
            log.push('---- inner');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('---- inner capture');
          },
        }}
        parentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('--- inner parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('--- inner parent capture');
          },
        }}
        outerProps={{
          [eventConfig.reactEvent]: e => {
            log.push('-- outer');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('-- outer capture');
          },
        }}
        outerParentRef={node => {
          if (node) {
            // No cleanup, assume we render once.
            node.addEventListener(
              eventConfig.nativeEvent,
              e => {
                log.push('- outer parent capture (native)');
                e.stopPropagation(); // <---------
              },
              {capture: true},
            );
          }
        }}
        outerParentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('- outer parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            expect(e.type).toBe(eventConfig.reactEventType);
            log.push('- outer parent capture');
          },
        }}
      />,
    );
    expect(log.length).toBe(0);
    eventConfig.dispatch(targetRef.current);
    // The outer root has already received the event,
    // so the capture phrase runs for it. But the inner
    // root is prevented from receiving it by the native
    // handler in the outer native capture phase.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
      - outer parent capture (native)
    `);
  }

  function testNativeStopPropagationInInnerCapturePhase(eventConfig, Fixture) {
    const log = [];
    const targetRef = {current: null};
    render(
      <Fixture
        type={eventConfig.type}
        targetRef={targetRef}
        targetProps={{
          [eventConfig.reactEvent]: e => {
            log.push('---- inner');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('---- inner capture');
          },
        }}
        parentRef={node => {
          if (node) {
            // No cleanup, assume we render once.
            node.addEventListener(
              eventConfig.nativeEvent,
              e => {
                log.push('--- inner parent capture (native)');
                e.stopPropagation(); // <---------
              },
              {capture: true},
            );
          }
        }}
        parentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('--- inner parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('--- inner parent capture');
          },
        }}
        outerProps={{
          [eventConfig.reactEvent]: e => {
            log.push('-- outer');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('-- outer capture');
          },
        }}
        outerParentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('- outer parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            expect(e.type).toBe(eventConfig.reactEventType);
            log.push('- outer parent capture');
          },
        }}
      />,
    );
    expect(log.length).toBe(0);
    eventConfig.dispatch(targetRef.current);
    // The inner root has already received the event, so
    // all React capture phase listeners should run.
    // But then the native handler stops propagation
    // so none of the bubbling React handlers would run.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
      --- inner parent capture
      ---- inner capture
      --- inner parent capture (native)
    `);
  }

  function testNativeStopPropagationInInnerBubblePhase(eventConfig, Fixture) {
    const log = [];
    const targetRef = {current: null};
    render(
      <Fixture
        type={eventConfig.type}
        targetRef={node => {
          targetRef.current = node;
          if (node) {
            // No cleanup, assume we render once.
            node.addEventListener(eventConfig.nativeEvent, e => {
              log.push('---- inner (native)');
              e.stopPropagation(); // <---------
            });
          }
        }}
        targetProps={{
          [eventConfig.reactEvent]: e => {
            log.push('---- inner');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('---- inner capture');
          },
        }}
        parentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('--- inner parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('--- inner parent capture');
          },
        }}
        outerProps={{
          [eventConfig.reactEvent]: e => {
            log.push('-- outer');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('-- outer capture');
          },
        }}
        outerParentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('- outer parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            expect(e.type).toBe(eventConfig.reactEventType);
            log.push('- outer parent capture');
          },
        }}
      />,
    );
    expect(log.length).toBe(0);
    eventConfig.dispatch(targetRef.current);
    // The capture phase is entirely unaffected.
    // Then, we get into the bubble phase.
    // We start with the native innermost handler.
    // It stops propagation, so nothing else happens.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
      --- inner parent capture
      ---- inner capture
      ---- inner (native)
    `);
  }

  function testNativeStopPropagationInOuterBubblePhase(eventConfig, Fixture) {
    const log = [];
    const targetRef = {current: null};
    render(
      <Fixture
        type={eventConfig.type}
        targetRef={targetRef}
        targetProps={{
          [eventConfig.reactEvent]: e => {
            log.push('---- inner');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('---- inner capture');
          },
        }}
        parentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('--- inner parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('--- inner parent capture');
          },
        }}
        outerRef={node => {
          if (node) {
            // No cleanup, assume we render once.
            node.addEventListener(eventConfig.nativeEvent, e => {
              log.push('-- outer (native)');
              e.stopPropagation(); // <---------
            });
          }
        }}
        outerProps={{
          [eventConfig.reactEvent]: e => {
            log.push('-- outer');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            log.push('-- outer capture');
          },
        }}
        outerParentProps={{
          [eventConfig.reactEvent]: e => {
            log.push('- outer parent');
          },
          [eventConfig.reactEvent + 'Capture']: e => {
            expect(e.type).toBe(eventConfig.reactEventType);
            log.push('- outer parent capture');
          },
        }}
      />,
    );
    expect(log.length).toBe(0);
    eventConfig.dispatch(targetRef.current);
    // The event bubbles upwards through the inner tree.
    // Then it reaches the native handler which stops propagation.
    // As a result, it never reaches the outer React root,
    // and thus the outer React event handlers don't fire.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
      --- inner parent capture
      ---- inner capture
      ---- inner
      --- inner parent
      -- outer (native)
    `);
  }



  function unindent(str) {
    return str[0]
      .split('\n')
      .map(s => s.trim())
      .filter(s => s !== '');
  }
})