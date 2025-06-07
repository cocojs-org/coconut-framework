import getListener from './getListener';
import { topLevelEventsToReactNames } from './DOMEventProperties';

function dispatchEvent(domEventName, container, nativeEvent) {
  let currentTarget = nativeEvent.target;
  while (currentTarget !== null && currentTarget !== container) {
    const reactName = topLevelEventsToReactNames.get(domEventName);
    const handler = getListener(currentTarget, reactName);
    handler?.()
    currentTarget = currentTarget.parentElement;
  }
}

function dispatchDiscreteEvent(
  domEventName,
  container,
  nativeEvent
) {
  dispatchEvent(domEventName, container, nativeEvent);
}

export function createEventListenerWrapperWithPriority(
  targetContainer,
  domEventName
) {
  return dispatchDiscreteEvent.bind(null, domEventName, targetContainer)
}