import { registerSimpleEvents, topLevelEventsToReactNames } from '../DOMEventProperties';
import { IS_CAPTURE_PHASE } from '../EventSystemFlags';
import { get as getFromShare, NAME } from 'shared';

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

    let reactEventType = domEventName;
    switch (domEventName) {
        case 'focusin':
            reactEventType = 'focus';
            break;
        case 'focusout':
            reactEventType = 'blur';
            break;
    }

    const inCapturePhase = (eventSystemFlags & IS_CAPTURE_PHASE) !== 0;
    const accumulateTargetOnly = !inCapturePhase && domEventName === 'scroll';
    const accumulateSinglePhaseListeners = getFromShare(NAME.accumulateSinglePhaseListeners);
    const listeners = accumulateSinglePhaseListeners(
        targetInst,
        reactName,
        nativeEvent.type,
        inCapturePhase,
        accumulateTargetOnly,
        nativeEvent
    );
    if (listeners.length > 0) {
        // todo 这里的event不能使用原生的，也要封装一下
        dispatchQueue.push({
            event: nativeEvent,
            reactEventType,
            listeners,
        });
    }
}

export { registerSimpleEvents as registerEvents, extractEvents };
