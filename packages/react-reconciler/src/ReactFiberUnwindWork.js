import { HostComponent, HostRoot } from './ReactWorkTags';
import { DidCapture, NoFlags, ShouldCapture } from './ReactFiberFlags';

function unwindWork(current, workInProgress) {
    switch (workInProgress.tag) {
        case HostRoot: {
            const flags = workInProgress.flags;
            if ((flags & ShouldCapture) !== NoFlags && (flags & DidCapture) === NoFlags) {
                // There was an error during render that wasn't captured by a suspense
                // boundary. Do a second pass on the root to unmount the children.
                workInProgress.flags = (flags & ~ShouldCapture) | DidCapture;
                return workInProgress;
            }
            return null;
        }
        case HostComponent: {
            return null;
        }
        default: {
            return null;
        }
    }
}

export { unwindWork };
