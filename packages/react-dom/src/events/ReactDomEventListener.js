import { get as getFromShare, NAME } from 'shared';
import { getClosestInstanceFromNode } from '../client/ReactDomComponentTree';

export let return_targetInst = null;

function dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay(
  domEventName,
  eventSystemFlags,
  targetContainer,
  nativeEvent
){

  findInstanceBlockingEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent);
  const dispatchEventForPluginEventSystem = getFromShare(NAME.dispatchEventForPluginEventSystem);
  dispatchEventForPluginEventSystem?.(
    domEventName,
    eventSystemFlags,
    nativeEvent,
    return_targetInst,
    targetContainer,
  )
}

function dispatchEvent(domEventName, eventSystemFlags, targetContainer, nativeEvent) {
  dispatchEventWithEnableCapturePhaseSelectiveHydrationWithoutDiscreteEventReplay(
    domEventName,
    eventSystemFlags,
    targetContainer,
    nativeEvent
  )
}

function dispatchDiscreteEvent(
  domEventName,
  eventSystemFlags,
  container,
  nativeEvent
) {
  dispatchEvent(domEventName, eventSystemFlags, container, nativeEvent);
}

export function createEventListenerWrapperWithPriority(
  targetContainer,
  domEventName,
  eventSystemFlags
) {
  return dispatchDiscreteEvent.bind(null, domEventName, eventSystemFlags, targetContainer)
}

export function findInstanceBlockingEvent(
  domEventName,
  eventSystemFlags,
  targetContainer,
  nativeEvent
) {
  return_targetInst = null;

  const nativeEventTarget = nativeEvent.target;
  let targetInst = getClosestInstanceFromNode(nativeEventTarget);

  return_targetInst = targetInst;
  // We're not blocked on anything.
  return null;
}
