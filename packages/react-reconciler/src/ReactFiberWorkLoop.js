import {beginWork} from "./ReactFiberBeginWork";
import { HostEffectMask, Incomplete, NoFlags } from './ReactFiberFlags';
import {completeWork} from "./ReactFiberCompleteWork";
import {unwindWork} from "./ReactFiberUnwindWork";
import { scheduleCallback } from './Scheduler';
import {createWorkInProgress} from "./ReactFiber";
import {finishQueueingConcurrentUpdates} from "./ReactFiberConcurrentUpdate";
import { commitLayoutEffects, commitMutationEffects } from './ReactFiberCommitWork';
import { get, NAME } from 'react-shared';
import { flushSyncCallbacks, scheduleSyncCallback } from './ReactFiberSyncTaskQueue';


export const NoContext = /*             */ 0b0000000;
const BatchedContext = /*               */ 0b0000001;
const RenderContext = /*                */ 0b0010000;
const CommitContext = /*                */ 0b0100000;
const LegacyUnbatchedContext = /*       */ 0b0001000;

let executionContext = NoContext;
let workInProgressRoot = null;
let workInProgress = null;

let hasUncaughtError = false;
let firstUncaughtError = null;

function prepareToThrowUncaughtError(error) {
  if (!hasUncaughtError) {
    hasUncaughtError = true;
    firstUncaughtError = error;
  }
}
export const onUncaughtError = prepareToThrowUncaughtError;

function performUnitOfWork(unitOfWork) {
  const current = unitOfWork.alternate;
  const next = beginWork(current, unitOfWork)


  unitOfWork.memoizedProps = unitOfWork.pendingProps;
  if (next === null) {
    completeUnitOfWork(unitOfWork);
  } else {
    workInProgress = next;
  }
}

function completeUnitOfWork(unitOfWork) {
  let completedWork = unitOfWork;
  do {
    const current = completedWork.alternate;
    const returnFiber = completedWork.return;

    if ((completedWork.flags & Incomplete) === NoFlags) {
      let next = completeWork(current, completedWork);
      if (next !== null) {
        workInProgress = next;
        return;
      }
    } else {
      const next = unwindWork(current, completedWork);
      if (next !== null) {
        // If completing this work spawned new work, do that next. We'll come
        // back here again.
        // Since we're restarting, remove anything that is not a host effect
        // from the effect tag.
        next.flags &= HostEffectMask;
        workInProgress = next;
        return;
      }

      if (returnFiber !== null) {
        returnFiber.flags |= Incomplete;
        returnFiber.deletions = null
      } else {
        workInProgress = null;
        return;
      }
    }

    const siblingFiber = completedWork.sibling;
    if (siblingFiber !== null) {
      workInProgress = siblingFiber;
      return;
    }

    completedWork = returnFiber;
    workInProgress = completedWork
  } while (completedWork !== null)
}

function workLoopSync() {
  while (workInProgress !== null) {
    performUnitOfWork(workInProgress)
  }
}

function prepareFreshStack(root) {
  workInProgressRoot = root;
  const rootWorkInProgress = createWorkInProgress(root.current, null);
  workInProgress = rootWorkInProgress;

  finishQueueingConcurrentUpdates();
  return workInProgress
}

function handleError(root, thrownValue) {
  do {
    let erroredWork = workInProgress;
    try {
      if (erroredWork === null || erroredWork.return === null) {
        workInProgress = null;
        return;
      }
      const throwException = get(NAME.throwException);
      throwException?.(
        root,
        erroredWork.return,
        erroredWork,
        thrownValue,
      );
      completeUnitOfWork(erroredWork);
    } catch (yetAnotherThrownValue) {
      console.info('yetAnotherThrownValue', yetAnotherThrownValue);
      thrownValue = yetAnotherThrownValue;
      if (workInProgress === erroredWork && erroredWork !== null) {
        // If this boundary has already errored, then we had trouble processing
        // the error. Bubble it to the next boundary.
        erroredWork = erroredWork.return;
        workInProgress = erroredWork;
      } else {
        erroredWork = workInProgress;
      }
      continue;
    }
    // Return to the normal work loop.
    return;
  } while (true)
}

function renderRootSync(root) {
  const prevExecutionContext = executionContext;
  executionContext |= RenderContext;

  if (workInProgressRoot !== root) {
    prepareFreshStack(root);
  }

  do {
    try {
      workLoopSync();
      break;
    } catch (thrownValue) {
      handleError(root, thrownValue)
    }
  } while (true)

  executionContext = prevExecutionContext;

  workInProgressRoot = null;
}

function commitRootImpl(root) {

  const finishedWork = root.finishedWork;
  root.finishedWork = null;

  commitMutationEffects(root, finishedWork)

  root.current = finishedWork;

  commitLayoutEffects(finishedWork, root);

  if (hasUncaughtError) {
    hasUncaughtError = false;
    const error = firstUncaughtError;
    firstUncaughtError = null;
    throw error;
  }
}

function commitRoot(root) {
  commitRootImpl(root);
}

function performSyncWorkOnRoot(root) {
  renderRootSync(root)

  const finishedWork = root.current.alternate;
  root.finishedWork = finishedWork;
  commitRoot(root)
  return null;
}

function ensureRootIsScheduled(root) {
  scheduleSyncCallback(performSyncWorkOnRoot.bind(null, root));
  scheduleCallback('fakePriorityLevel', flushSyncCallbacks)
}

export function flushSync(fn) {
  const prevExecutionContext = executionContext;
  executionContext |= BatchedContext;
  try {
    fn()
  } finally {
    executionContext = prevExecutionContext;
    // Flush the immediate callbacks that were scheduled during this batch.
    // Note that this will happen even if batchedUpdates is higher up
    // the stack.
    if ((executionContext & (RenderContext | CommitContext)) === NoContext) {
      flushSyncCallbacks();
    }
  }
}

export function batchedUpdates(fn, a) {
  const prevExecutionContext = executionContext;
  executionContext |= BatchedContext;
  try {
    return fn(a);
  } finally {
    executionContext = prevExecutionContext;
    // If there were legacy sync updates, flush them at the end of the outer
    // most batchedUpdates-like method.
    if (
      executionContext === NoContext
    ) {
      flushSyncCallbacks();
    }
  }
}

export function scheduleUpdateOnFiber(
  root,
  fiber
) {
  ensureRootIsScheduled(root)
  if (
    executionContext === NoContext
  ) {
    flushSyncCallbacks();
  }
}

export function isRenderPhase() {
  return (executionContext & RenderContext) !== NoContext;
}
