import { allNativeEvents } from './EventRegistry';
import { createEventListenerWrapperWithPriority } from './ReactDomEventListener';
import { addEventCaptureListener } from './EventListener';
import * as SimpleEventPlugin from './plugins/SimpleEventPlugin';

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
      listenToNativeEvent(domEventName, rootContainerElement)
    })
  }
}

function addTrappedEventListener(
  targetContainer,
  domEventName
) {
  let listener = createEventListenerWrapperWithPriority(targetContainer, domEventName)

  addEventCaptureListener(targetContainer, domEventName, listener)
}

export function listenToNativeEvent(
  domEventName,
  target
) {
  addTrappedEventListener(target, domEventName);
}