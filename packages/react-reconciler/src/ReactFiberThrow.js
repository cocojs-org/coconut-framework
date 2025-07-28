import {
  onUncaughtError
} from './ReactFiberWorkLoop';
import { CaptureUpdate, createUpdate, enqueueCapturedUpdate } from './ReactFiberClassUpdateQueue';
import { HostRoot } from './ReactWorkTags';
import { register, NAME } from 'shared';
import { Incomplete, ShouldCapture } from './ReactFiberFlags';

function createRootErrorUpdate(
  fiber,
  errorInfo
) {
  const update = createUpdate();
  update.tag = CaptureUpdate;
  update.payload = {element: null};
  update.callback = () => {
    onUncaughtError(errorInfo);
  };
  return update;
}

function throwException(
  root,
  returnFiber,
  sourceFiber,
  value,
) {
  sourceFiber.flags |= Incomplete;
  sourceFiber.firstEffect = sourceFiber.lastEffect = null;
  let workInProgress = returnFiber;
  do {
    switch (workInProgress.tag) {
      case HostRoot: {
        const errorInfo = value;
        workInProgress.flags |= ShouldCapture;
        const update = createRootErrorUpdate(workInProgress, errorInfo);
        enqueueCapturedUpdate(workInProgress, update);
        return;
      }
    }
    workInProgress = workInProgress.return;
  } while (workInProgress !== null);
}

// todo 这是为了引入此js，不然会因为tree sheak丢了
const reference = () => {};
export { reference }

register(NAME.throwException, throwException);  // export { throwException }