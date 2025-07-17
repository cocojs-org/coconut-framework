import { registerTwoPhaseEvent } from '../EventRegistry';
import { getNodeFromInstance } from '../../client/ReactDomComponentTree';
import isTextInputElement from '../isTextInputElement';
import { updateValueIfChanged } from '../../client/inputValueTracking';
import { enqueueStateRestore } from '../ReactDOMControllerdComponent';

function registerEvents() {
  registerTwoPhaseEvent('onChange', [
    'change',
    'click',
    'input'
  ])
}

function getInstIfValueChanged(targetInst) {
  const targetNode = getNodeFromInstance(targetInst);
  if (updateValueIfChanged(targetNode)) {
    return targetInst;
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

function createAndAccumulateChangeEvent(
  dispatchQueue,
  inst,
  nativeEvent,
  target
) {
  enqueueStateRestore(target);
  // todo
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
  if (isTextInputElement(targetNode)) {
    getTargetInstFun = getTargetInstForInputOrChangeEvent;
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
    }

    return;
  }
}

export { registerEvents, extractEvents }