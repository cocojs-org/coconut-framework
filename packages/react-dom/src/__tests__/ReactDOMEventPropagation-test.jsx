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
    jsx = (await import('coco-mvc')).jsx;
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

    it('onContextMenu', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onContextMenu',
        reactEventType: 'contextmenu',
        nativeEvent: 'contextmenu',
        dispatch(node) {
          node.dispatchEvent(
            new MouseEvent('contextmenu', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onCopy', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onCopy',
        reactEventType: 'copy',
        nativeEvent: 'copy',
        dispatch(node) {
          node.dispatchEvent(
            new Event('copy', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onCut', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onCut',
        reactEventType: 'cut',
        nativeEvent: 'cut',
        dispatch(node) {
          node.dispatchEvent(
            new Event('cut', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onDoubleClick', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onDoubleClick',
        reactEventType: 'dblclick',
        nativeEvent: 'dblclick',
        dispatch(node) {
          node.dispatchEvent(
            new KeyboardEvent('dblclick', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onDrag', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onDrag',
        reactEventType: 'drag',
        nativeEvent: 'drag',
        dispatch(node) {
          node.dispatchEvent(
            new MouseEvent('drag', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onDragEnd', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onDragEnd',
        reactEventType: 'dragend',
        nativeEvent: 'dragend',
        dispatch(node) {
          node.dispatchEvent(
            new MouseEvent('dragend', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onDragEnter', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onDragEnter',
        reactEventType: 'dragenter',
        nativeEvent: 'dragenter',
        dispatch(node) {
          node.dispatchEvent(
            new MouseEvent('dragenter', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onDragExit', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onDragExit',
        reactEventType: 'dragexit',
        nativeEvent: 'dragexit',
        dispatch(node) {
          node.dispatchEvent(
            new MouseEvent('dragexit', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onDragLeave', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onDragLeave',
        reactEventType: 'dragleave',
        nativeEvent: 'dragleave',
        dispatch(node) {
          node.dispatchEvent(
            new MouseEvent('dragleave', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onDragOver', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onDragOver',
        reactEventType: 'dragover',
        nativeEvent: 'dragover',
        dispatch(node) {
          node.dispatchEvent(
            new MouseEvent('dragover', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onDragStart', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onDragStart',
        reactEventType: 'dragstart',
        nativeEvent: 'dragstart',
        dispatch(node) {
          node.dispatchEvent(
            new MouseEvent('dragstart', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onDrop', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onDrop',
        reactEventType: 'drop',
        nativeEvent: 'drop',
        dispatch(node) {
          node.dispatchEvent(
            new MouseEvent('drop', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onFocus', () => {
      testNativeBubblingEvent({
        type: 'input',
        reactEvent: 'onFocus',
        reactEventType: 'focus',
        nativeEvent: 'focusin',
        dispatch(node) {
          const e = new Event('focusin', {
            bubbles: true,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onGotPointerCapture', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onGotPointerCapture',
        reactEventType: 'gotpointercapture',
        nativeEvent: 'gotpointercapture',
        dispatch(node) {
          node.dispatchEvent(
            new Event('gotpointercapture', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onKeyDown', () => {
      testNativeBubblingEvent({
        type: 'input',
        reactEvent: 'onKeyDown',
        reactEventType: 'keydown',
        nativeEvent: 'keydown',
        dispatch(node) {
          node.dispatchEvent(
            new KeyboardEvent('keydown', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onKeyPress', () => {
      testNativeBubblingEvent({
        type: 'input',
        reactEvent: 'onKeyPress',
        reactEventType: 'keypress',
        nativeEvent: 'keypress',
        dispatch(node) {
          node.dispatchEvent(
            new KeyboardEvent('keypress', {
              keyCode: 13,
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onKeyUp', () => {
      testNativeBubblingEvent({
        type: 'input',
        reactEvent: 'onKeyUp',
        reactEventType: 'keyup',
        nativeEvent: 'keyup',
        dispatch(node) {
          node.dispatchEvent(
            new KeyboardEvent('keyup', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onLostPointerCapture', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onLostPointerCapture',
        reactEventType: 'lostpointercapture',
        nativeEvent: 'lostpointercapture',
        dispatch(node) {
          node.dispatchEvent(
            new Event('lostpointercapture', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onMouseDown', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onMouseDown',
        reactEventType: 'mousedown',
        nativeEvent: 'mousedown',
        dispatch(node) {
          node.dispatchEvent(
            new MouseEvent('mousedown', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onMouseOut', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onMouseOut',
        reactEventType: 'mouseout',
        nativeEvent: 'mouseout',
        dispatch(node) {
          node.dispatchEvent(
            new MouseEvent('mouseout', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onMouseOver', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onMouseOver',
        reactEventType: 'mouseover',
        nativeEvent: 'mouseover',
        dispatch(node) {
          node.dispatchEvent(
            new MouseEvent('mouseover', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onMouseUp', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onMouseUp',
        reactEventType: 'mouseup',
        nativeEvent: 'mouseup',
        dispatch(node) {
          node.dispatchEvent(
            new MouseEvent('mouseup', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onPaste', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onPaste',
        reactEventType: 'paste',
        nativeEvent: 'paste',
        dispatch(node) {
          node.dispatchEvent(
            new Event('paste', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onPointerCancel', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onPointerCancel',
        reactEventType: 'pointercancel',
        nativeEvent: 'pointercancel',
        dispatch(node) {
          node.dispatchEvent(
            new Event('pointercancel', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onPointerDown', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onPointerDown',
        reactEventType: 'pointerdown',
        nativeEvent: 'pointerdown',
        dispatch(node) {
          node.dispatchEvent(
            new Event('pointerdown', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onPointerMove', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onPointerMove',
        reactEventType: 'pointermove',
        nativeEvent: 'pointermove',
        dispatch(node) {
          node.dispatchEvent(
            new Event('pointermove', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onPointerOut', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onPointerOut',
        reactEventType: 'pointerout',
        nativeEvent: 'pointerout',
        dispatch(node) {
          node.dispatchEvent(
            new Event('pointerout', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onPointerOver', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onPointerOver',
        reactEventType: 'pointerover',
        nativeEvent: 'pointerover',
        dispatch(node) {
          node.dispatchEvent(
            new Event('pointerover', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onPointerUp', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onPointerUp',
        reactEventType: 'pointerup',
        nativeEvent: 'pointerup',
        dispatch(node) {
          node.dispatchEvent(
            new Event('pointerup', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onReset', () => {
      testNativeBubblingEvent({
        type: 'form',
        reactEvent: 'onReset',
        reactEventType: 'reset',
        nativeEvent: 'reset',
        dispatch(node) {
          const e = new Event('reset', {
            bubbles: true,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onSubmit', () => {
      testNativeBubblingEvent({
        type: 'form',
        reactEvent: 'onSubmit',
        reactEventType: 'submit',
        nativeEvent: 'submit',
        dispatch(node) {
          const e = new Event('submit', {
            bubbles: true,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onTouchCancel', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onTouchCancel',
        reactEventType: 'touchcancel',
        nativeEvent: 'touchcancel',
        dispatch(node) {
          node.dispatchEvent(
            new Event('touchcancel', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onTouchEnd', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onTouchEnd',
        reactEventType: 'touchend',
        nativeEvent: 'touchend',
        dispatch(node) {
          node.dispatchEvent(
            new Event('touchend', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onTouchMove', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onTouchMove',
        reactEventType: 'touchmove',
        nativeEvent: 'touchmove',
        dispatch(node) {
          node.dispatchEvent(
            new Event('touchmove', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onTouchStart', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onTouchStart',
        reactEventType: 'touchstart',
        nativeEvent: 'touchstart',
        dispatch(node) {
          node.dispatchEvent(
            new Event('touchstart', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });

    it('onWheel', () => {
      testNativeBubblingEvent({
        type: 'div',
        reactEvent: 'onWheel',
        reactEventType: 'wheel',
        nativeEvent: 'wheel',
        dispatch(node) {
          node.dispatchEvent(
            new Event('wheel', {
              bubbles: true,
              cancelable: true,
            }),
          );
        },
      });
    });
  })

  describe('non-bubbling events that bubble in React', () => {
    it('onAbort', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onAbort',
        reactEventType: 'abort',
        nativeEvent: 'abort',
        dispatch(node) {
          const e = new Event('abort', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onCancel', () => {
      testEmulatedBubblingEvent({
        type: 'dialog',
        reactEvent: 'onCancel',
        reactEventType: 'cancel',
        nativeEvent: 'cancel',
        dispatch(node) {
          const e = new Event('cancel', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onCanPlay', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onCanPlay',
        reactEventType: 'canplay',
        nativeEvent: 'canplay',
        dispatch(node) {
          const e = new Event('canplay', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onCanPlayThrough', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onCanPlayThrough',
        reactEventType: 'canplaythrough',
        nativeEvent: 'canplaythrough',
        dispatch(node) {
          const e = new Event('canplaythrough', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onClose', () => {
      testEmulatedBubblingEvent({
        type: 'dialog',
        reactEvent: 'onClose',
        reactEventType: 'close',
        nativeEvent: 'close',
        dispatch(node) {
          const e = new Event('close', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onDurationChange', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onDurationChange',
        reactEventType: 'durationchange',
        nativeEvent: 'durationchange',
        dispatch(node) {
          const e = new Event('durationchange', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onEmptied', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onEmptied',
        reactEventType: 'emptied',
        nativeEvent: 'emptied',
        dispatch(node) {
          const e = new Event('emptied', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onEncrypted', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onEncrypted',
        reactEventType: 'encrypted',
        nativeEvent: 'encrypted',
        dispatch(node) {
          const e = new Event('encrypted', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onEnded', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onEnded',
        reactEventType: 'ended',
        nativeEvent: 'ended',
        dispatch(node) {
          const e = new Event('ended', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onError', () => {
      testEmulatedBubblingEvent({
        type: 'img',
        reactEvent: 'onError',
        reactEventType: 'error',
        nativeEvent: 'error',
        dispatch(node) {
          const e = new Event('error', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onInvalid', () => {
      testEmulatedBubblingEvent({
        type: 'input',
        reactEvent: 'onInvalid',
        reactEventType: 'invalid',
        nativeEvent: 'invalid',
        dispatch(node) {
          const e = new Event('invalid', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onLoad', () => {
      testEmulatedBubblingEvent({
        type: 'img',
        reactEvent: 'onLoad',
        reactEventType: 'load',
        nativeEvent: 'load',
        dispatch(node) {
          const e = new Event('load', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onLoadedData', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onLoadedData',
        reactEventType: 'loadeddata',
        nativeEvent: 'loadeddata',
        dispatch(node) {
          const e = new Event('loadeddata', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onLoadedMetadata', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onLoadedMetadata',
        reactEventType: 'loadedmetadata',
        nativeEvent: 'loadedmetadata',
        dispatch(node) {
          const e = new Event('loadedmetadata', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onLoadStart', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onLoadStart',
        reactEventType: 'loadstart',
        nativeEvent: 'loadstart',
        dispatch(node) {
          const e = new Event('loadstart', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onPause', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onPause',
        reactEventType: 'pause',
        nativeEvent: 'pause',
        dispatch(node) {
          const e = new Event('pause', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onPlay', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onPlay',
        reactEventType: 'play',
        nativeEvent: 'play',
        dispatch(node) {
          const e = new Event('play', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onPlaying', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onPlaying',
        reactEventType: 'playing',
        nativeEvent: 'playing',
        dispatch(node) {
          const e = new Event('playing', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onProgress', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onProgress',
        reactEventType: 'progress',
        nativeEvent: 'progress',
        dispatch(node) {
          const e = new Event('progress', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onRateChange', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onRateChange',
        reactEventType: 'ratechange',
        nativeEvent: 'ratechange',
        dispatch(node) {
          const e = new Event('ratechange', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onResize', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onResize',
        reactEventType: 'resize',
        nativeEvent: 'resize',
        dispatch(node) {
          const e = new Event('resize', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onSeeked', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onSeeked',
        reactEventType: 'seeked',
        nativeEvent: 'seeked',
        dispatch(node) {
          const e = new Event('seeked', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onSeeking', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onSeeking',
        reactEventType: 'seeking',
        nativeEvent: 'seeking',
        dispatch(node) {
          const e = new Event('seeking', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onStalled', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onStalled',
        reactEventType: 'stalled',
        nativeEvent: 'stalled',
        dispatch(node) {
          const e = new Event('stalled', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onSuspend', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onSuspend',
        reactEventType: 'suspend',
        nativeEvent: 'suspend',
        dispatch(node) {
          const e = new Event('suspend', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onTimeUpdate', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onTimeUpdate',
        reactEventType: 'timeupdate',
        nativeEvent: 'timeupdate',
        dispatch(node) {
          const e = new Event('timeupdate', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });
  
    it('onToggle', () => {
      testEmulatedBubblingEvent({
        type: 'details',
        reactEvent: 'onToggle',
        reactEventType: 'toggle',
        nativeEvent: 'toggle',
        dispatch(node) {
          const e = new Event('toggle', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });
  
    it('onVolumeChange', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onVolumeChange',
        reactEventType: 'volumechange',
        nativeEvent: 'volumechange',
        dispatch(node) {
          const e = new Event('volumechange', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });

    it('onWaiting', () => {
      testEmulatedBubblingEvent({
        type: 'video',
        reactEvent: 'onWaiting',
        reactEventType: 'waiting',
        nativeEvent: 'waiting',
        dispatch(node) {
          const e = new Event('waiting', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });
  })

  describe('non-bubbling events that do not bubble in React', () => {
    it('onScroll', () => {
      testNonBubblingEvent({
        type: 'div',
        reactEvent: 'onScroll',
        reactEventType: 'scroll',
        nativeEvent: 'scroll',
        dispatch(node) {
          const e = new Event('scroll', {
            bubbles: false,
            cancelable: true,
          });
          node.dispatchEvent(e);
        },
      });
    });
  });

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

  // Events that bubble in React but not in the browser.
  // React attaches them to the elements.
  function testEmulatedBubblingEvent(config) {
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
    testEmulatedBubblingEventWithTargetListener(config, Fixture);
    testEmulatedBubblingEventWithoutTargetListener(config, Fixture);
    testReactStopPropagationInOuterCapturePhase(config, Fixture);
    testReactStopPropagationInInnerCapturePhase(config, Fixture);
    testReactStopPropagationInInnerBubblePhase(config, Fixture);
    testNativeStopPropagationInOuterCapturePhase(config, Fixture);
    testNativeStopPropagationInInnerCapturePhase(config, Fixture);
    testNativeStopPropagationInInnerEmulatedBubblePhase(config, Fixture);
  }

  // Events that don't bubble either in React or in the browser.
  function testNonBubblingEvent(config) {

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
    testNonBubblingEventWithTargetListener(config, Fixture);
    testNonBubblingEventWithoutTargetListener(config, Fixture);
    testReactStopPropagationInOuterCapturePhase(config, Fixture);
    testReactStopPropagationInInnerCapturePhase(config, Fixture);
    testReactStopPropagationInInnerBubblePhase(config, Fixture);
    testNativeStopPropagationInOuterCapturePhase(config, Fixture);
    testNativeStopPropagationInInnerCapturePhase(config, Fixture);
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

  function testEmulatedBubblingEventWithTargetListener(eventConfig, Fixture) {
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
    // This event doesn't bubble natively, but React emulates it.
    // Since the element is created by the inner React, the bubbling
    // stops at the inner parent and never reaches the outer React.
    // In the future, we might consider not bubbling these events
    // at all, in in which case inner parent also wouldn't be logged.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
      --- inner parent capture
      ---- inner capture
      ---- inner
      --- inner parent
    `);
  }

  function testEmulatedBubblingEventWithoutTargetListener(eventConfig, Fixture) {
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
    // This event doesn't bubble natively, but React emulates it.
    // Since the element is created by the inner React, the bubbling
    // stops at the inner parent and never reaches the outer React.
    // In the future, we might consider not bubbling these events
    // at all, in in which case inner parent also wouldn't be logged.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
      --- inner parent capture
      --- inner parent
    `);
  }

  function testNativeStopPropagationInInnerEmulatedBubblePhase(eventConfig, Fixture) {
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
    // This event does not natively bubble, so React
    // attaches the listener directly to the element.
    // As a result, by the time our custom native listener
    // fires, it is too late to do anything -- the React
    // emulated bubbilng has already happened.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
      --- inner parent capture
      ---- inner capture
      ---- inner
      --- inner parent
      ---- inner (native)
    `);
  }

    function testNonBubblingEventWithTargetListener(eventConfig, Fixture) {
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
    // This event doesn't bubble natively, and React is
    // not emulating it either. So it only reaches the
    // target and stops there.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
      --- inner parent capture
      ---- inner capture
      ---- inner
    `);
  }

  function testNonBubblingEventWithoutTargetListener(eventConfig, Fixture) {
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
    // This event doesn't bubble native, and React doesn't
    // emulate bubbling either. Since we don't have a target
    // listener, only capture phase listeners fire.
    expect(log).toEqual(unindent`
      - outer parent capture
      -- outer capture
      --- inner parent capture
    `);
  }

  function unindent(str) {
    return str[0]
      .split('\n')
      .map(s => s.trim())
      .filter(s => s !== '');
  }
})