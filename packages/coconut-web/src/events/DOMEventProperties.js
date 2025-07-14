import { registerTwoPhaseEvent } from './EventRegistry';

export const topLevelEventsToReactNames = new Map();

const simpleEventPluginEvents = [
  'cancel',
  'click',
  'close',
  'contextMenu',
  'copy',
  'cut',
  'drag',
  'dragEnd',
  'dragEnter',
  'dragExit',
  'dragLeave',
  'dragOver',
  'dragStart',
  'drop',
  'error',
  'gotPointerCapture',
  'invalid',
  'keyDown',
  'keyPress',
  'keyUp',
  'load',
  'loadStart',
  'lostPointerCapture',
  'mouseDown',
  'mouseOut',
  'mouseOver',
  'mouseUp',
  'paste',
  'play',
  'pointerCancel',
  'pointerDown',
  'pointerMove',
  'pointerOut',
  'pointerOver',
  'pointerUp',
  'reset',
  'scroll',
  'submit',
  'touchCancel',
  'touchEnd',
  'touchStart',
  'toggle',
  'touchMove',
  'wheel',
]

function registerSimpleEvent(domEventName, reactName) {
  topLevelEventsToReactNames.set(domEventName, reactName);
  registerTwoPhaseEvent(reactName, [domEventName]);
}

export function registerSimpleEvents() {
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = simpleEventPluginEvents[i];
    const domEventName = eventName.toLowerCase();
    const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1);
    registerSimpleEvent(domEventName, 'on' + capitalizedEvent);
  }

  registerSimpleEvent('dblclick', 'onDoubleClick');
  registerSimpleEvent('focusin', 'onFocus');
}