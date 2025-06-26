import {mountChildFibers, reconcileChildFibers} from "./ReactChildFiber";
import {ClassComponent, HostComponent, HostRoot, HostText} from "./ReactWorkTags";
import {constructClassInstance, mountClassInstance, updateClassInstance} from "./ReactFiberClassComponent";
import {cloneUpdateQueue, processUpdateQueue} from "./ReactFiberClassUpdateQueue";
import {shouldSetTextContent} from "ReactFiberHostConfig";
import { ContentReset, Ref } from './ReactFiberFlags';

export function reconcileChildren(
  current,
  workInProgress,
  nextChildren
) {
  if (current === null) {
    workInProgress.child = mountChildFibers(workInProgress, null, nextChildren);
  } else {
    workInProgress.child = reconcileChildFibers(workInProgress, current.child, nextChildren);
  }
}

function markRef(current, workInProgress) {
  const ref = workInProgress.ref;
  if (
    (current === null && ref !== null) ||
    (current !== null && current.ref !== ref)
  ) {
    workInProgress.flags |= Ref;
  }
}

function finishClassComponent(
  current,
  workInProgress,
  Component,
  shouldUpdate,
) {
  markRef(current, workInProgress);
  if (!shouldUpdate) {
    return null;
  }
  const instance = workInProgress.stateNode;
  const render = instance.render;
  const nextChildren = render.call(instance);
  reconcileChildren(current, workInProgress, nextChildren);

  return workInProgress.child;
}

function updateHostRoot(current, workInProgress) {
  const nextProps = workInProgress.pendingProps;
  cloneUpdateQueue(current, workInProgress);
  processUpdateQueue(workInProgress, nextProps, null);


  const nextState = workInProgress.memoizedState;
  const nextChildren = nextState.element;

  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

function updateClassComponent(
  current,
  workInProgress,
  Component,
  nextProps
) {
  const instance = workInProgress.stateNode;
  let shouldUpdate = false;
  if (instance === null) {
    constructClassInstance(workInProgress, Component, nextProps);
    mountClassInstance(workInProgress, Component, nextProps);
    shouldUpdate = true;
  } else {
    shouldUpdate = updateClassInstance(current, workInProgress, Component, nextProps);
  }

  const nextUnitOfWork = finishClassComponent(
    current,
    workInProgress,
    Component,
    shouldUpdate,
  );
  return nextUnitOfWork;
}

function updateHostComponent(
  current,
  workInProgress
) {
  const type = workInProgress.type;
  const nextProps = workInProgress.pendingProps;
  const prevProps = current !== null ? current.memoizedProps : null;

  let nextChildren = nextProps.children;

  const isDirectTextChild = shouldSetTextContent(type, nextProps);
  if (isDirectTextChild) {
    // We special case a direct text child of a host node. This is a common
    // case. We won't handle it as a reified child. We will instead handle
    // this in the host environment that also has access to this prop. That
    // avoids allocating another HostText fiber and traversing it.
    nextChildren = null;
  } else if (prevProps !== null && shouldSetTextContent(type, prevProps)) {
    // If we're switching from a direct text child to a normal child, or to
    // empty, we need to schedule the text content to be reset.
    workInProgress.flags |= ContentReset;
  }

  markRef(current, workInProgress);
  reconcileChildren(current, workInProgress, nextChildren);
  return workInProgress.child;
}

function updateHostText(
  current,
  workInProgress
) {
  return null;
}


function beginWork(
  current,
  workInProgress
) {
  switch (workInProgress.tag) {
    case HostRoot: {
      return updateHostRoot(current, workInProgress);
    }
    case ClassComponent: {
      const Component = workInProgress.type;
      const unresolvedProps = workInProgress.pendingProps;
      return updateClassComponent(
        current,
        workInProgress,
        Component,
        unresolvedProps,
      );
    }
    case HostComponent: {
      return updateHostComponent(current, workInProgress);
    }
    case HostText: {
      return updateHostText(current, workInProgress);
    }
  }

  throw new Error(
    'Unknown unit of work tag. This error is likely caused by a bug in React. Please file an issue.'
  )
}

export { beginWork }