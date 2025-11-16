import {enqueueConcurrentClassUpdate} from "./ReactFiberConcurrentUpdate";
import { assign } from "react-shared";
import { Callback, DidCapture, ShouldCapture } from './ReactFiberFlags';

export const UpdateState = 0;
export const ForceUpdate = 2;
export const CaptureUpdate = 3;

/**
 * field: 说明是类组件修改了某个field
 */
export function createUpdate(field) {
  field = (typeof field === 'string' && !!field) ? field : null;
  const update = {
    field,
    tag: UpdateState,
    payload: null,
    callback: null,
    next: null,
  }
  return update;
}

export function enqueueUpdate(
  fiber,
  update
) {
  const updateQueue = fiber.updateQueue;
  if (updateQueue === null) {
    return null;
  }

  const sharedQueue = updateQueue.shared;
  return enqueueConcurrentClassUpdate(fiber, sharedQueue, update)
}

export function enqueueCapturedUpdate(
  workInProgress,
  capturedUpdate,
) {
  // Captured updates are updates that are thrown by a child during the render
  // phase. They should be discarded if the render is aborted. Therefore,
  // we should only put them on the work-in-progress queue, not the current one.
  let queue = (workInProgress.updateQueue);

  // Append the update to the end of the list.
  const lastBaseUpdate = queue.lastBaseUpdate;
  if (lastBaseUpdate === null) {
    queue.firstBaseUpdate = capturedUpdate;
  } else {
    lastBaseUpdate.next = capturedUpdate;
  }
  queue.lastBaseUpdate = capturedUpdate;
}

export function initializeUpdateQueue(fiber) {
  const queue = {
    baseState: fiber.memoizedState,
    firstBaseUpdate: null,
    lastBaseUpdate: null,
    shared: {
      pending: null,
      interleaved: null
    },
    effects: null,
  }
  fiber.updateQueue = queue;
}


export function cloneUpdateQueue(
  current,
  workInProgress
) {
  const queue = workInProgress.updateQueue;
  const currentQueue = current.updateQueue;
  if (queue === currentQueue) {
    const clone = {
      baseState: currentQueue.baseState,
      firstBaseUpdate: currentQueue.firstBaseUpdate,
      lastBaseUpdate: currentQueue.lastBaseUpdate,
      shared: currentQueue.shared,
      effects: currentQueue.effects,
    }
    workInProgress.updateQueue = clone;
  }
}

function getStateFromUpdate(
  workInProgress,
  queue,
  update,
  prevState,
  nextProps,
  instance,
  field,
) {
  switch (update.tag) {
    case CaptureUpdate: {
      workInProgress.flags =
        (workInProgress.flags & ~ShouldCapture) | DidCapture;
    }
    // Intentional fallthrough
    case UpdateState: {
      const payload = update.payload;
      const _prevState = field ? prevState[field] : prevState;
      let partialState;
      if (typeof payload === 'function') {
        partialState = payload.call(instance, _prevState, nextProps);
      } else {
        partialState = payload;
      }
      if (field) {
        // 如果是field，可以允许null或者undefined
        return partialState;
      } else if ((partialState === null || partialState === undefined)) {
        // Null and undefined are treated as no-ops.
        return _prevState;
      }
      return partialState;
    }
    case ForceUpdate: {
      return prevState;
    }
  }
}


export function processUpdateQueue(
  workInProgress,
  props,
  instance
) {
  const queue = workInProgress.updateQueue;

  let firstBaseUpdate = queue.firstBaseUpdate;
  let lastBaseUpdate = queue.lastBaseUpdate;

  let pendingQueue = queue.shared.pending;
  if (pendingQueue !== null) {
    queue.shared.pending = null;
    const lastPendingUpdate = pendingQueue;
    const firstPendingUpdate = lastPendingUpdate.next;
    lastPendingUpdate.next = null;
    if (lastBaseUpdate === null) {
      firstBaseUpdate = firstPendingUpdate;
    } else {
      lastBaseUpdate.next = firstPendingUpdate;
    }
    lastBaseUpdate = lastPendingUpdate

    const current = workInProgress.alternate;
    if (current !== null) {
      const currentQueue = current.updateQueue;
      const currentLastBaseUpdate = currentQueue.lastBaseUpdate;
      if (currentLastBaseUpdate !== lastBaseUpdate) {
        if (currentLastBaseUpdate === null) {
          currentQueue.firstBaseUpdate = firstPendingUpdate;
        } else {
          currentLastBaseUpdate.next = firstPendingUpdate;
        }
        currentQueue.lastBaseUpdate = lastPendingUpdate;
      }
    }
  }

  if (firstBaseUpdate !== null) {
    let newState = queue.baseState || {};

    let newBaseState = null;
    let newFirstBaseUpdate = null;
    let newLastBaseUpdate = null;

    let update = firstBaseUpdate;
    do {
      /**
       * React的state是一个对象，但coconut是多个field
       * 同时coconut还要兼顾首次渲染这种情况
       */
      const {field} = update;
      const _newState = getStateFromUpdate(workInProgress, queue, update, newState, props, instance, field);
      if (field) {
        // 更新特定的field
        newState = assign({}, newState, {[field]: _newState});
      } else {
        newState = assign({}, newState, _newState);
      }
      const callback = update.callback;
      if (callback !== null) {
        workInProgress.flags |= Callback;
        const effects = queue.effects;
        if (effects === null) {
          queue.effects = [update];
        } else {
          effects.push(update);
        }
      }
      update = update.next;
      if (update === null) {
        pendingQueue = queue.shared.pending;
        if (pendingQueue === null) {
          break;
        } else {
          throw new Error('=======todo===========');
        }
      }
    } while (true)

    if (newLastBaseUpdate === null) {
      newBaseState = newState;
    }

    queue.baseState = newBaseState
    queue.firstBaseUpdate = newFirstBaseUpdate;
    queue.lastBaseUpdate = newLastBaseUpdate;

    workInProgress.memoizedState = newState;
  }
}

function callCallback(callback, context) {
  if (typeof callback !== 'function') {
    throw new Error(
      'Invalid argument passed as callback. Expected a function. Instead ' +
      `received: ${callback}`,
    );
  }

  callback.call(context);
}

export function commitUpdateQueue(
  finishedWork,
  finishedQueue,
  instance,
) {
  // Commit the effects
  const effects = finishedQueue.effects;
  finishedQueue.effects = null;
  if (effects !== null) {
    for (let i = 0; i < effects.length; i++) {
      const effect = effects[i];
      const callback = effect.callback;
      if (callback !== null) {
        effect.callback = null;
        callCallback(callback, instance);
      }
    }
  }
}
