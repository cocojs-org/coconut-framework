import { ClassComponent, IndeterminateComponent, HostComponent, HostText, HostRoot } from './ReactWorkTags';
import { NoFlags } from './ReactFiberFlags';

function shouldConstruct(Component) {
    const prototype = Component.prototype;
    return !!prototype;
}

function FiberNode(tag, pendingProps, key) {
    this.tag = tag;
    this.key = key;
    this.elementType = null;
    this.type = null;
    this.stateNode = null;

    this.return = null;
    this.child = null;
    this.sibling = null;
    this.index = 0;

    this.pendingProps = pendingProps;
    this.memoizedProps = null;
    this.memoizedState = null;
    this.updateQueue = null;

    // effects
    this.flags = NoFlags;
    this.subtreeFlags = NoFlags;
    this.deletions = null;

    this.alternate = null;
}

const createFiber = function (tag, pendingProps, key) {
    return new FiberNode(tag, pendingProps, key);
};

export function createFiberFromText(content) {
    const fiber = createFiber(HostText, content, null);
    return fiber;
}

export function createFiberFromTypeAndProps(type, key, pendingProps, owner) {
    let fiberTag = IndeterminateComponent;
    if (typeof type === 'function') {
        if (shouldConstruct(type)) {
            fiberTag = ClassComponent;
        }
    } else if (typeof type === 'string') {
        fiberTag = HostComponent;
    } else {
        throw new Error('Unknown component type: ' + type);
    }
    const fiber = createFiber(fiberTag, pendingProps, key);
    fiber.elementType = type;
    fiber.type = type;
    return fiber;
}

export function createHostRootFiber(tag) {
    return createFiber(HostRoot, null, null);
}

export function createWorkInProgress(current, pendingProps) {
    let workInProgress = current.alternate;
    if (workInProgress === null) {
        workInProgress = createFiber(current.tag, pendingProps, current.key);
        workInProgress.elementType = current.elementType;
        workInProgress.type = current.type;
        workInProgress.stateNode = current.stateNode;
        workInProgress.alternate = current;
        current.alternate = workInProgress;
    } else {
        workInProgress.pendingProps = pendingProps;
        workInProgress.type = current.type;
        workInProgress.flags = NoFlags;
        workInProgress.subtreeFlags = NoFlags;
        workInProgress.deletions = null;
    }
    workInProgress.child = current.child;
    workInProgress.memoizedProps = current.memoizedProps;
    workInProgress.memoizedState = current.memoizedState;
    workInProgress.updateQueue = current.updateQueue;

    workInProgress.sibling = current.sibling;
    workInProgress.index = current.index;

    return workInProgress;
}

export function createFiberFromElement(element) {
    const type = element.type;
    const key = element.key;
    const pendingProps = element.props;
    const fiber = createFiberFromTypeAndProps(type, key, pendingProps, null);

    return fiber;
}
