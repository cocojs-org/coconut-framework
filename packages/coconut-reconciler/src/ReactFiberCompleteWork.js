import {ClassComponent, HostComponent, HostRoot, HostText} from "./ReactWorkTags";
import {createInstance, finalizeInitialChildren, createTextInstance, prepareUpdate} from "ReactFiberHostConfig";
import {NoFlags, Update} from "./ReactFiberFlags";

function markUpdate(workInProgress) {
  workInProgress.flags |= Update;
}

const updateHostComponent = function (
  current,
  workInProgress,
  type,
  newProps
) {
  const oldProps = current.memoizedProps;
  if (oldProps === newProps) {
    return;
  }
  const instance = workInProgress.stateNode;
  const updatePayload = prepareUpdate(
    instance,
    type,
    oldProps,
    newProps
  )
  workInProgress.updateQueue = updatePayload;
  if (updatePayload) {
    markUpdate(workInProgress)
  }
}

const updateHostText = function (
  current,
  workInProgress,
  oldText,
  newText
) {
  if (oldText !== newText) {
    markUpdate(workInProgress);
  }
}

function appendAllChildren(parent, workInProgress) {
  let node = workInProgress.child;
  while (node !== null) {
    if (node.tag === HostComponent || node.tag === HostText) {
      parent.appendChild(node.stateNode)
    } else if (node.child !== null) {
      node.child.return = node;
      node = node.child;
      continue;
    }
    if (node === workInProgress) {
      return;
    }

    while (node.sibling === null) {
      if (node.return === null || node.return === workInProgress) {
        return;
      }
      node = node.return;
    }
    node.sibling.return = node.return;
    node = node.sibling;
  }
}

function bubbleProperties(completedWork) {
  let subtreeFlags = NoFlags;
  let child = completedWork.child;
  while (child !== null) {
    subtreeFlags |= child.subtreeFlags;
    subtreeFlags |= child.flags;
    child = child.sibling;
  }
  completedWork.subtreeFlags |= subtreeFlags;
}

function completeWork(
  current,
  workInProgress
) {
  const newProps = workInProgress.pendingProps;
  switch (workInProgress.tag) {
    case HostRoot: {
      bubbleProperties(workInProgress)
      return null;
    }
    case ClassComponent: {
      bubbleProperties(workInProgress);
      return null
    }
    case HostComponent: {
      const type = workInProgress.type;
      if (current !== null && workInProgress.stateNode !== null) {
        updateHostComponent(
          current,
          workInProgress,
          type,
          newProps,
        )
      } else {
        const instance = createInstance(
          type,
          newProps
        )

        appendAllChildren(instance, workInProgress)
        workInProgress.stateNode = instance;

        if(finalizeInitialChildren(instance, type, newProps)) {
          markUpdate(workInProgress)
        }
      }
      bubbleProperties(workInProgress)
      return null;
    }
    case HostText: {
      const newText = newProps;
      if (current && workInProgress.stateNode !== null) {
        const oldText = current.memoizedProps;
        updateHostText(current, workInProgress, oldText, newText);
      } else {
        workInProgress.stateNode = createTextInstance(newText);
      }
      bubbleProperties(workInProgress)
      return null;
    }
  }
}

export { completeWork }