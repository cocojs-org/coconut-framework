import { registerSimpleEvents, topLevelEventsToReactNames } from '../DOMEventProperties';
import { IS_CAPTURE_PHASE } from '../EventSystemFlags';
import getListener from '../getListener';
import { HostComponent } from 'reconciler-ReactWorkTags';

function extractEvents(
  dispatchQueue,
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget,
  eventSystemFlags,
  targetContainer
) {
  const reactName = topLevelEventsToReactNames.get(domEventName);
  if (reactName === undefined) {
    return;
  }

  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
  const accumulateTargetOnly = !inCapturePhase && (domEventName === 'scroll');
  const listeners = accumulateSinglePhaseListeners(
    targetInst,
    reactName,
    nativeEvent.type,
    inCapturePhase,
    accumulateTargetOnly,
    nativeEvent
  )
  if (listeners.length > 0) {
    // todo 这里的event不能使用原生的，也要封装一下
    dispatchQueue.push({
      event: nativeEvent,
      listeners
    });
  }
}

function executeDispatch(
  domEvent,
  listener,
  currentTarget,
) {
  // const type = event.type || 'unknown-event';
  // domEvent.currentTarget = currentTarget;
  // coconut: 暂时不准备使用合成事件
  listener({
    type: domEvent.type,
    target: domEvent.target,
    currentTarget: currentTarget
  });
  // domEvent.currentTarget = null;
}

function processDispatchQueueItemsInOrder(
  domEvent,
  dispatchListeners,
  inCapturePhase,
) {
  if (inCapturePhase) {
    for (let i = dispatchListeners.length - 1; i >= 0; i--) {
      const {instance, currentTarget, listener} = dispatchListeners[i];
      executeDispatch(domEvent, listener, currentTarget);
    }
  } else {
    for (let i = 0; i < dispatchListeners.length; i++) {
      const {instance, currentTarget, listener} = dispatchListeners[i];
      executeDispatch(domEvent, listener, currentTarget);
    }
  }
}

export function processDispatchQueue(dispatchQueue, eventSystemFlags) {
  const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
  for (let i = 0; i < dispatchQueue.length; i++) {
    const { event, listeners } = dispatchQueue[i];
    processDispatchQueueItemsInOrder(event, listeners, inCapturePhase);
  }
}

function createDispatchListener(
  instance,
  listener,
  currentTarget,
) {
  return {
    instance,
    listener,
    currentTarget,
  };
}

export function accumulateSinglePhaseListeners(
  targetFiber,
  reactName,
  nativeEventType,
  inCapturePhase,
  accumulateTargetOnly,
  nativeEvent
) {
  const captureName = reactName !== null ? reactName + 'Capture' : null;
  const reactEventName = inCapturePhase ? captureName : reactName;
  let listeners = [];

  let instance = targetFiber;
  let lastHostComponent = null;

  while (instance !== null) {
    const {stateNode, tag} = instance;
    if (tag === HostComponent && stateNode !== null) {
      lastHostComponent = stateNode;
      if (reactEventName !== null) {
        const listener = getListener(instance, reactEventName);
        if (listener != null) {
          listeners.push(createDispatchListener(instance, listener, lastHostComponent));
        }
      }
    }
    if (accumulateTargetOnly) {
      break;
    }
    instance = instance.return;
  }

  return listeners;
}


export {registerSimpleEvents as registerEvents, extractEvents};