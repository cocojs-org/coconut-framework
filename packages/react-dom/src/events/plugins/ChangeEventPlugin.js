import { registerTwoPhaseEvent } from '../EventRegistry';
import { getNodeFromInstance } from '../../client/ReactDomComponentTree';
import isTextInputElement from '../isTextInputElement';
import { updateValueIfChanged } from '../../client/inputValueTracking';
import { enqueueStateRestore } from '../ReactDOMControllerdComponent';
import { get as getFromShare, NAME } from 'shared';
import { setDefaultValue } from '../../client/ReactDomInput';

function registerEvents() {
  registerTwoPhaseEvent('onChange', [
    'change',
    'click',
    'focusin',
    'focusout',
    'input',
    'keydown',
    'keyup',
    'selectionchange',
  ])
}

function shouldUseClickEvent(elem) {
  // Use the `click` event to detect changes to checkbox and radio inputs.
  // This approach works across all browsers, whereas `change` does not fire
  // until `blur` in IE8.
  const nodeName = elem.nodeName;
  return (
    nodeName &&
    nodeName.toLowerCase() === 'input' &&
    (elem.type === 'checkbox' || elem.type === 'radio')
  );
}

function getInstIfValueChanged(targetInst) {
  const targetNode = getNodeFromInstance(targetInst);
  if (updateValueIfChanged(targetNode)) {
    return targetInst;
  }
}

function getTargetInstForClickEvent(domEventName, targetInst) {
  if (domEventName === 'click') {
    return getInstIfValueChanged(targetInst);
  }
}

function getTargetInstForInputOrChangeEvent(
  domEventName,
  targetInst,
) {
  if (domEventName === 'input' || domEventName === 'change') {
    return getInstIfValueChanged(targetInst);
  }
}

function getTargetInstForChangeEvent(domEventName, targetInst) {
  if (domEventName === 'change') {
    return targetInst;
  }
}

function handleControlledInputBlur(node) {
  const state = node._wrapperState;

  if (!state || !state.controlled || node.type !== 'number') {
    return;
  }

  setDefaultValue(node, 'number', node.value);
}

function createAndAccumulateChangeEvent(
  dispatchQueue,
  inst,
  nativeEvent,
  target
) {
  enqueueStateRestore(target);
  const accumulateTwoPhaseListeners = getFromShare(NAME.accumulateTwoPhaseListeners);
  const listeners = accumulateTwoPhaseListeners(inst, 'onChange');
  if (listeners.length > 0) {
    // todo 这里的event不能使用原生的，也要封装一下
    dispatchQueue.push({
      event: nativeEvent,
      reactEventType: 'change',
      listeners
    });
  }
}

/**
 * SECTION: handle `change` event
 */
function shouldUseChangeEvent(elem) {
  const nodeName = elem.nodeName && elem.nodeName.toLowerCase();
  return (
    nodeName === 'select' ||
    (nodeName === 'input' && elem.type === 'file')
  );
}

function extractEvents(
  dispatchQueue,
  domEventName,
  targetInst,
  nativeEvent,
  nativeEventTarget,
) {
  const targetNode = targetInst ? getNodeFromInstance(targetInst) : window;

  let getTargetInstFun;
  if (shouldUseChangeEvent(targetNode)) {
    getTargetInstFun = getTargetInstForChangeEvent;
  } else if (isTextInputElement(targetNode)) {
    getTargetInstFun = getTargetInstForInputOrChangeEvent;
  } else if (shouldUseClickEvent(targetNode)) {
    getTargetInstFun = getTargetInstForClickEvent;
  }

  if (getTargetInstFun) {
    const inst = getTargetInstFun(domEventName, targetInst);
    if (inst) {
      createAndAccumulateChangeEvent(
        dispatchQueue,
        inst,
        nativeEvent,
        nativeEventTarget
      )
      return;
    }
  }

  if (domEventName === 'focusout') {
    handleControlledInputBlur(targetNode);
  }
}

export { registerEvents, extractEvents }