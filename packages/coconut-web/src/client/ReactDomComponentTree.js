const randomKey = Math.random()
  .toString(36)
  .slice(2);
const internalInstanceKey = '__reactFiber$' + randomKey;
const internalPropsKey = '__reactProps$' + randomKey;
const internalContainerInstanceKey = '__reactContainer$' + randomKey;
const internalEventHandlersKey = '__reactEvents$' + randomKey;

export function precacheFiberNode(
  hostInst,
  node,
) {
  node[internalInstanceKey] = hostInst;
}

export function getFiberCurrentPropsFromNode(
  node
) {
  return node[internalPropsKey] || null;
}

export function updateFiberProps(
  node,
  props
) {
  node[internalPropsKey] = props;
}

export function getEventListenerSet(node) {
  let elementListenerSet = node[internalEventHandlersKey];
  if (elementListenerSet === undefined) {
    elementListenerSet = node[internalEventHandlersKey] = new Set();
  }
  return elementListenerSet;
}

export function markContainerAsRoot(hostRoot, node) {
  node[internalContainerInstanceKey] = hostRoot;
}

export function unmarkContainerAsRoot(node) {
  node[internalContainerInstanceKey] = null;
}

export function getClosestInstanceFromNode(targetNode) {
  let targetInst = targetNode[internalInstanceKey];
  if (targetInst) {
    // Don't return HostRoot or SuspenseComponent here.
    return targetInst;
  }
  // If the direct event target isn't a React owned DOM node, we need to look
  // to see if one of its parents is a React owned DOM node.
  let parentNode = targetNode.parentNode;
  while (parentNode) {
    targetInst =
      parentNode[internalContainerInstanceKey] ||
      parentNode[internalInstanceKey];
    if (targetInst) {
      return targetInst;
    }
    targetNode = parentNode;
    parentNode = targetNode.parentNode;
  }

  return null
}