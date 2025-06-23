import {beginWork} from "./ReactFiberBeginWork";
import { HostEffectMask, Incomplete, NoFlags } from './ReactFiberFlags';
import {completeWork} from "./ReactFiberCompleteWork";
import {unwindWork} from "./ReactFiberUnwindWork";
import { scheduleCallback } from './ReactFiberSyncTaskQueue';
import {createWorkInProgress} from "./ReactFiber";
import {finishQueueingConcurrentUpdates} from "./ReactFiberConcurrentUpdate";
import { commitLayoutEffects, commitMutationEffects } from './ReactFiberCommitWork';
import { get, NAME } from 'shared';


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
  root.callbackNode = null;

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
  /**
   * 我们没有使用lane，所以发现有任务都可以复用
   */
  // Check if there's an existing task. We may be able to reuse it.
  if (root.callbackNode) {
    return;
  }
  root.callbackNode = scheduleCallback('fakePriorityLevel', performSyncWorkOnRoot.bind(null, root))
}

export function unbatchedUpdates(fn) {
  const prevExecutionContext = executionContext;
  executionContext &= ~BatchedContext;
  executionContext |= LegacyUnbatchedContext;
  try {
    fn()
  } finally {
    executionContext = prevExecutionContext;
  }
}

export function scheduleUpdateOnFiber(
  root,
  fiber
) {
  if (
    // Check if we're inside unbatchedUpdates
    (executionContext & LegacyUnbatchedContext) !== NoContext &&
    // Check if we're not already rendering
    (executionContext & (RenderContext | CommitContext)) === NoContext
  ) {
    performSyncWorkOnRoot(root);
  } else {
    ensureRootIsScheduled(root)
  }
}

export function isRenderPhase() {
  return (executionContext & RenderContext) !== NoContext;
}
