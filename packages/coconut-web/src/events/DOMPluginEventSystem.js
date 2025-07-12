import { allNativeEvents } from './EventRegistry';
import { createEventListenerWrapperWithPriority } from './ReactDomEventListener';
import { addEventBubbleListener, addEventCaptureListener } from './EventListener';
import * as SimpleEventPlugin from './plugins/SimpleEventPlugin';
import { processDispatchQueue } from './plugins/SimpleEventPlugin';
import { IS_CAPTURE_PHASE, IS_NON_DELEGATED } from './EventSystemFlags';
import { HostRoot, HostComponent, HostText } from 'reconciler-ReactWorkTags';
import { register, NAME } from 'shared';
import { getClosestInstanceFromNode, getEventListenerSet } from '../client/ReactDomComponentTree';
import { batchedUpdates } from './ReactDOMUpdateBatching';
import { DOCUMENT_NODE } from '../shared/HTMLNodeType';

SimpleEventPlugin.registerEvents();

const listeningMarker =
  '_reactListening' +
  Math.random()
    .toString(36)
    .slice(2);

export function listenToAllSupportedEvents(rootContainerElement) {
  if (!rootContainerElement[listeningMarker]) {
    rootContainerElement[listeningMarker] = true;
    allNativeEvents.forEach(domEventName => {
      // We handle selectionchange separately because it
      // doesn't bubble and needs to be on the document.
      if (domEventName !== 'selectionchange') {
        if (!nonDelegatedEvents.has(domEventName)) {
          listenToNativeEvent(domEventName, false, rootContainerElement)
        }
        listenToNativeEvent(domEventName, true, rootContainerElement)
      }
    })
    const ownerDocument =
      rootContainerElement.nodeType === DOCUMENT_NODE
        ? rootContainerElement
        : rootContainerElement.ownerDocument;
    if (ownerDocument !== null) {
      // The selectionchange event also needs deduplication
      // but it is attached to the document.
      if (!ownerDocument[listeningMarker]) {
        ownerDocument[listeningMarker] = true;
        listenToNativeEvent('selectionchange', false, ownerDocument);
      }
    }
  }
}

function addTrappedEventListener(
  targetContainer,
  domEventName,
  eventSystemFlags,
  isCapturePhaseListener
) {
  let listener = createEventListenerWrapperWithPriority(targetContainer, domEventName, eventSystemFlags)

  if (isCapturePhaseListener) {
    addEventCaptureListener(targetContainer, domEventName, listener)
  } else {
    addEventBubbleListener(targetContainer, domEventName, listener)
  }
}

export function listenToNativeEvent(
  domEventName,
  isCapturePhaseListener,
  target
) {
  if (__DEV__) {
    if (nonDelegatedEvents.has(domEventName) && !isCapturePhaseListener) {
      console.error(
        'Did not expect a listenToNativeEvent() call for "%s" in the bubble phase. ' +
        'This is a bug in React. Please file an issue.',
        domEventName,
      );
    }
  }

  let eventSystemFlags = 0;
  if (isCapturePhaseListener) {
    eventSystemFlags |= IS_CAPTURE_PHASE;
  }
  addTrappedEventListener(target, domEventName, eventSystemFlags, isCapturePhaseListener);
}

// List of events that need to be individually attached to media elements.
export const mediaEventTypes = [
  'abort',
  'canplay',
  'canplaythrough',
  'durationchange',
  'emptied',
  'encrypted',
  'ended',
  'error',
  'loadeddata',
  'loadedmetadata',
  'loadstart',
  'pause',
  'play',
  'playing',
  'progress',
  'ratechange',
  'resize',
  'seeked',
  'seeking',
  'stalled',
  'suspend',
  'timeupdate',
  'volumechange',
  'waiting',
]

// We should not delegate these events to the container, but rather
// set them on the actual target element itself. This is primarily
// because these events do not consistently bubble in the DOM.
export const nonDelegatedEvents = new Set([
  'cancel',
  'close',
  'invalid',
  'load',
  'scroll',
  'toggle',
  // In order to reduce bytes, we insert the above array of media events
  // into this Set. Note: the "error" event isn't an exclusive media event,
  // and can occur on other elements too. Rather than duplicate that event,
  // we just take it from the media events array.
  ...mediaEventTypes,
]);

export function getListenerSetKey(
  domEventName,
  capture,
) {
  return `${domEventName}__${capture ? 'capture' : 'bubble'}`;
}

export function listenToNonDelegatedEvent(
  domEventName,
  targetElement
) {
  const isCapturePhaseListener = false;
  const listenerSet = getEventListenerSet(targetElement)
  const listenerSetKey = getListenerSetKey(domEventName, isCapturePhaseListener)
  if (!listenerSet.has(listenerSetKey)) {
    addTrappedEventListener(
      targetElement,
      domEventName,
      IS_NON_DELEGATED,
      isCapturePhaseListener,
    );
    listenerSet.add(listenerSetKey);
  }
}

function isMatchingRootContainer(
  grandContainer,
  targetContainer
) {
  return grandContainer === targetContainer;
}

function extractEvents(
  dispatchQueue,
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
  targetContainer
) {
  SimpleEventPlugin.extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer,
  );
}

function dispatchEventsForPlugins(
  domEventName,
  eventSystemFlags,
  nativeEvent,
  targetInst,
  targetContainer
) {
  const nativeEventTarget = nativeEvent.target;
  const dispatchQueue = [];
  extractEvents(
    dispatchQueue,
    domEventName,
    targetInst,
    nativeEvent,
    nativeEventTarget,
    eventSystemFlags,
    targetContainer
  )
  processDispatchQueue(dispatchQueue, eventSystemFlags);
}

export function dispatchEventForPluginEventSystem(
  domEventName,
  eventSystemFlags,
  nativeEvent,
  targetInst,
  targetContainer
) {
  let ancestorInst = targetInst;
  if ((eventSystemFlags & IS_NON_DELEGATED) === 0) {
    if (targetInst !== null) {
      let node = targetInst;
      mainLoop: while (true) {
        if (node === null) {
          return;
        }
        const nodeTag = node.tag;
        if (nodeTag === HostRoot) {
          let container = node.stateNode.containerInfo;
          if (isMatchingRootContainer(container, targetContainer)) {
            break;
          }
          // Now we need to find it's corresponding host fiber in the other
          // tree. To do this we can use getClosestInstanceFromNode, but we
          // need to validate that the fiber is a host instance, otherwise
          // we need to traverse up through the DOM till we find the correct
          // node that is from the other tree.
          while (container !== null) {
            const parentNode = getClosestInstanceFromNode(container);
            if (parentNode === null) {
              return;
            }
            const parentTag = parentNode.tag;
            if (parentTag === HostComponent || parentTag === HostText) {
              node = ancestorInst = parentNode;
              continue mainLoop;
            }
            container = container.parentNode;
          }
        }
        node = node.return;
      }
    }
  }

  batchedUpdates(() => {
    dispatchEventsForPlugins(
      domEventName,
      eventSystemFlags,
      nativeEvent,
      ancestorInst,
      targetContainer,
    )
  })
}
register(NAME.dispatchEventForPluginEventSystem, dispatchEventForPluginEventSystem);