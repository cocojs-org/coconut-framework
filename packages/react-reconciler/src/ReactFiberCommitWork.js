import { ClassComponent, HostComponent, HostRoot, HostText } from './ReactWorkTags';
import {
    ChildDeletion,
    ContentReset,
    LayoutMask,
    MutationMask,
    NoFlags,
    Passive,
    PassiveMask,
    Placement,
    Ref,
    Update,
} from './ReactFiberFlags';
import {
    resetTextContent,
    commitTextUpdate,
    commitUpdate,
    removeChild,
    removeChildFromContainer,
    commitMount,
    detachDeletedInstance,
} from 'react-dom-ReactFiberHostConfig';
import { commitUpdateQueue } from './ReactFiberClassUpdateQueue';
import { deletedTreeCleanUpLevel } from 'react-shared';
import { disconnectStore } from './coco-mvc/autowired';

let nextEffect = null;
let inProgressRoot = null;

function isHostParent(fiber) {
    return fiber.tag === HostComponent || fiber.tag === HostRoot;
}

function getHostSibling(fiber) {
    let node = fiber;
    siblings: while (true) {
        while (node.sibling === null) {
            if (node.return === null || isHostParent(node.return)) {
                return null;
            }
            node = node.return;
        }
        node.sibling.return = node.return;
        node = node.sibling;
        while (node.tag !== HostComponent && node.tag !== HostText) {
            if (node.flags & Placement) {
                continue siblings;
            }
            if (node.child === null) {
                continue siblings;
            } else {
                node.child.return = node;
                node = node.child;
            }
        }
        if (!(node.flags & Placement)) {
            return node.stateNode;
        }
    }
}

const callComponentWillUnmountWithTimer = function (current, instance) {
    instance.viewWillUnmount();
};

function safelyCallComponentWillUnmount(current, nearestMountedAncestor, instance) {
    callComponentWillUnmountWithTimer(current, instance);
}

function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
    const tag = node.tag;
    const isHost = tag === HostComponent || tag === HostText;
    if (isHost) {
        const stateNode = node.stateNode;
        if (before) {
            parent.insertBefore(stateNode, before);
        } else {
            parent.appendChild(stateNode);
        }
    } else {
        const child = node.child;
        if (child !== null) {
            insertOrAppendPlacementNodeIntoContainer(child, before, parent);
            let sibling = child.sibling;
            while (sibling !== null) {
                insertOrAppendPlacementNodeIntoContainer(sibling, before, parent);
                sibling = sibling.sibling;
            }
        }
        // throw new Error('todo')
    }
}

function detachFiberMutation(fiber) {
    // Cut off the return pointer to disconnect it from the tree.
    // This enables us to detect and warn against state updates on an unmounted component.
    // It also prevents events from bubbling from within disconnected components.
    //
    // Ideally, we should also clear the child pointer of the parent alternate to let this
    // get GC:ed but we don't know which for sure which parent is the current
    // one so we'll settle for GC:ing the subtree of this child.
    // This child itself will be GC:ed when the parent updates the next time.
    //
    // Note that we can't clear child or sibling pointers yet.
    // They're needed for passive effects and for findDOMNode.
    // We defer those fields, and all other cleanup, to the passive phase (see detachFiberAfterEffects).
    //
    // Don't reset the alternate yet, either. We need that so we can detach the
    // alternate's fields in the passive phase. Clearing the return pointer is
    // sufficient for findDOMNode semantics.
    const alternate = fiber.alternate;
    if (alternate !== null) {
        alternate.return = null;
    }
    fiber.return = null;
}

let hostParent = null;
let hostParentIsContainer = false;
function commitDeletionEffects(root, returnFiber, deletedFiber) {
    let parent = returnFiber;
    findParent: while (parent !== null) {
        switch (parent.tag) {
            case HostComponent:
                hostParent = parent.stateNode;
                hostParentIsContainer = false;
                break findParent;
            case HostRoot: {
                hostParent = parent.stateNode.containerInfo;
                hostParentIsContainer = true;
                break findParent;
            }
        }
        parent = parent.return;
    }
    if (hostParent === null) {
        throw new Error(
            'Expected to find a host parent. This error is likely caused by ' + 'a bug in React. Please file an issue.'
        );
    }
    commitDeletionEffectsOnFiber(root, returnFiber, deletedFiber);
    hostParent = null;
    hostParentIsContainer = false;

    detachFiberMutation(deletedFiber);
}

function recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, parent) {
    let child = parent.child;
    while (child !== null) {
        commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, child);
        child = child.sibling;
    }
}

function commitDeletionEffectsOnFiber(finishedRoot, nearestMountedAncestor, deletedFiber) {
    switch (deletedFiber.tag) {
        case HostComponent:
            safelyDetachRef(deletedFiber);
        // Intentional fallthrough to next branch
        case HostText:
            const prevHostParent = hostParent;
            const prevHostParentIsContainer = hostParentIsContainer;
            hostParent = null;
            recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
            hostParent = prevHostParent;
            hostParentIsContainer = prevHostParentIsContainer;
            if (hostParent !== null) {
                if (hostParentIsContainer) {
                    removeChildFromContainer(hostParent, deletedFiber.stateNode);
                } else {
                    removeChild(hostParent, deletedFiber.stateNode);
                }
            }
            return;
        case ClassComponent: {
            safelyDetachRef(deletedFiber);
            const instance = deletedFiber.stateNode;
            disconnectStore(instance);
            if (typeof instance.viewWillUnmount === 'function') {
                safelyCallComponentWillUnmount(deletedFiber, nearestMountedAncestor, instance);
            }
            recursivelyTraverseDeletionEffects(finishedRoot, nearestMountedAncestor, deletedFiber);
            return;
        }
    }
}

function getHostParentFiber(fiber) {
    let parent = fiber.return;
    while (parent !== null) {
        if (isHostParent(parent)) {
            return parent;
        }
        parent = parent.return;
    }

    throw new Error(
        'Expected to find a host parent. This error is likely caused by a bug ' + 'in React. Please file an issue.'
    );
}

function commitPlacement(finishedWork) {
    const parentFiber = getHostParentFiber(finishedWork);
    switch (parentFiber.tag) {
        case HostComponent: {
            const parent = parentFiber.stateNode;
            if (parentFiber.flags & ContentReset) {
                // Reset the text content of the parent before doing any insertions
                resetTextContent(parent);
                // Clear ContentReset from the effect tag
                parentFiber.flags &= ~ContentReset;
            }
            const before = getHostSibling(finishedWork);
            insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
            break;
        }
        case HostRoot: {
            const parent = parentFiber.stateNode.containerInfo;
            const before = getHostSibling(finishedWork);
            insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent);
            break;
        }
    }
}

function recursivelyTraverseMutationEffects(root, parentFiber) {
    // Deletions effects can be scheduled on any fiber type. They need to happen
    // before the children effects hae fired.
    const deletions = parentFiber.deletions;
    if (deletions !== null) {
        for (let i = 0; i < deletions.length; i++) {
            commitDeletionEffects(root, parentFiber, deletions[i]);
        }
    }
    if (parentFiber.subtreeFlags & MutationMask) {
        let child = parentFiber.child;
        while (child !== null) {
            commitMutationEffectsOnFiber(child, root);
            child = child.sibling;
        }
    }
}

function commitReconciliationEffects(finishedWork) {
    const flags = finishedWork.flags;
    if (flags & Placement) {
        try {
            commitPlacement(finishedWork);
        } catch (e) {
            console.info('eeeee', e);
        }
        finishedWork.flags &= ~Placement;
    }
}

function commitMutationEffectsOnFiber(finishedWork, root) {
    const current = finishedWork.alternate;
    const flags = finishedWork.flags;
    switch (finishedWork.tag) {
        case HostComponent: {
            recursivelyTraverseMutationEffects(root, finishedWork);
            commitReconciliationEffects(finishedWork);

            if (flags & Ref) {
                if (current !== null) {
                    safelyDetachRef(current);
                }
            }

            if (finishedWork.flags & ContentReset) {
                const instance = finishedWork.stateNode;
                try {
                    resetTextContent(instance);
                } catch (error) {
                    // todo captureCommitPhaseError(finishedWork, finishedWork.return, error);
                }
            }
            if (flags & Update) {
                const instance = finishedWork.stateNode;
                if (instance !== null) {
                    const newProps = finishedWork.memoizedProps;
                    const oldProps = current !== null ? current.memoizedProps : newProps;
                    const type = finishedWork.type;
                    const updatePayload = finishedWork.updateQueue;
                    finishedWork.updateQueue = null;
                    if (updatePayload !== null) {
                        commitUpdate(instance, updatePayload, type, oldProps, newProps);
                    }
                }
            }
            return;
        }
        case HostRoot: {
            recursivelyTraverseMutationEffects(root, finishedWork);
            commitReconciliationEffects(finishedWork);
            return;
        }
        case ClassComponent: {
            recursivelyTraverseMutationEffects(root, finishedWork);
            commitReconciliationEffects(finishedWork);

            if (flags & Ref) {
                if (current !== null) {
                    safelyDetachRef(current);
                }
            }
            return;
        }
        case HostText: {
            recursivelyTraverseMutationEffects(root, finishedWork);
            commitReconciliationEffects(finishedWork);

            if (flags & Update) {
                const textInstance = finishedWork.stateNode;
                const newText = finishedWork.memoizedProps;
                const oldText = current !== null ? current.memoizedProps : newText;

                commitTextUpdate(textInstance, oldText, newText);
            }
            return;
        }
    }
}

export function commitMutationEffects(root, finishedWork) {
    commitMutationEffectsOnFiber(finishedWork, root);
}

export function commitLayoutEffects(finishedWork, root) {
    inProgressRoot = root;
    nextEffect = finishedWork;

    commitLayoutEffects_begin(finishedWork, root);

    inProgressRoot = null;
}

function commitLayoutEffects_begin(subtreeRoot, root) {
    while (nextEffect !== null) {
        const fiber = nextEffect;
        const firstChild = fiber.child;

        if ((fiber.subtreeFlags & LayoutMask) !== NoFlags && firstChild !== null) {
            firstChild.return = fiber;
            nextEffect = firstChild;
        } else {
            commitLayoutMountEffects_complete(subtreeRoot, root);
        }
    }
}

function commitLayoutMountEffects_complete(subtreeRoot, root) {
    while (nextEffect !== null) {
        const fiber = nextEffect;
        if ((fiber.flags & LayoutMask) !== NoFlags) {
            const current = fiber.alternate;
            commitLayoutEffectOnFiber(root, current, fiber);
        }

        if (fiber === subtreeRoot) {
            nextEffect = null;
            return;
        }

        const sibling = fiber.sibling;
        if (sibling !== null) {
            sibling.return = fiber.return;
            nextEffect = sibling;
            return;
        }

        nextEffect = fiber.return;
    }
}

function commitLayoutEffectOnFiber(finishedRoot, current, finishedWork) {
    if ((finishedWork.flags & LayoutMask) !== NoFlags) {
        switch (finishedWork.tag) {
            case ClassComponent: {
                const instance = finishedWork.stateNode;
                if (finishedWork.flags & Update) {
                    if (current === null) {
                        instance.viewDidMount();
                    } else {
                        const prevProps = current.memoizedProps;
                        const prevState = current.memoizedState;
                        instance.viewDidUpdate(prevProps, prevState);
                    }
                }
                break;
            }
            case HostRoot: {
                const updateQueue = finishedWork.updateQueue;
                if (updateQueue !== null) {
                    let instance = null;
                    if (finishedWork.child !== null) {
                        switch (finishedWork.child.type) {
                            case HostComponent: {
                                instance = finishedWork.child.stateNode;
                                break;
                            }
                        }
                    }
                    commitUpdateQueue(finishedWork, updateQueue, instance);
                }
                break;
            }
            case HostComponent: {
                const instance = finishedWork.stateNode;
                if (current === null && finishedWork.flags & Update) {
                    const type = finishedWork.type;
                    const props = finishedWork.memoizedProps;
                    commitMount(instance, type, props);
                }
                break;
            }
        }
    }
    if (finishedWork.flags & Ref) {
        commitAttachRef(finishedWork);
    }
}

export function commitPassiveUnmountEffects(childFiber) {
    nextEffect = childFiber;
    commitPassiveUnmountEffects_begin();
}

function commitPassiveUnmountEffects_begin() {
    while (nextEffect !== null) {
        const fiber = nextEffect;
        const child = fiber.child;

        if ((nextEffect.flags & ChildDeletion) !== NoFlags) {
            const deletions = fiber.deletions;
            if (deletions !== null) {
                for (let i = 0; i < deletions.length; i++) {
                    const fiberToDelete = deletions[i];
                    nextEffect = fiberToDelete;
                    commitPassiveUnmountEffectsInsideOfDeleteTree_begin(fiberToDelete, fiber);
                }

                if (deletedTreeCleanUpLevel >= 1) {
                    // A fiber was deleted from this parent fiber, but it's still part of
                    // the previous (alternate) parent fiber's list of children. Because
                    // children are a linked list, an earlier sibling that's still alive
                    // will be connected to the deleted fiber via its `alternate`:
                    //
                    //   live fiber
                    //   --alternate--> previous live fiber
                    //   --sibling--> deleted fiber
                    //
                    // We can't disconnect `alternate` on nodes that haven't been deleted
                    // yet, but we can disconnect the `sibling` and `child` pointers.
                    const previousFiber = fiber.alternate;
                    if (previousFiber !== null) {
                        let detachedChild = previousFiber.child;
                        if (detachedChild !== null) {
                            previousFiber.child = null;
                            do {
                                const detachedSibling = detachedChild.sibling;
                                detachedChild.sibling = null;
                                detachedChild = detachedSibling;
                            } while (detachedChild !== null);
                        }
                    }
                }

                nextEffect = fiber;
            }
        }

        if ((fiber.subtreeFlags & PassiveMask) !== NoFlags && child !== null) {
            child.return = fiber;
            nextEffect = child;
        } else {
            commitPassiveUnmountEffects_complete();
        }
    }
}

function commitPassiveUnmountEffects_complete() {
    while (nextEffect !== null) {
        const fiber = nextEffect;
        if ((fiber.flags & Passive) !== NoFlags) {
            commitPassiveUnmountOnFiber(fiber);
        }

        const sibling = fiber.sibling;
        if (sibling !== null) {
            sibling.return = fiber.return;
            nextEffect = sibling;
            return;
        }

        nextEffect = fiber.return;
    }
}

function commitPassiveUnmountOnFiber(fiber) {
    // coco 因为我们没有函数组件，所以是一个空函数
}

function commitPassiveUnmountEffectsInsideOfDeleteTree_begin(deletedSubtreeRoot, nearestMountedAncestor) {
    while (nextEffect !== null) {
        const fiber = nextEffect;
        commitPassiveUnmountInsideDeletedTreeOnFiber(fiber, nearestMountedAncestor);

        const child = fiber.child;
        if (child !== null) {
            child.return = fiber;
            nextEffect = child;
        } else {
            commitPassiveUnmountEffectsInsideOfDeleteTree_complete(deletedSubtreeRoot);
        }
    }
}

function commitPassiveUnmountInsideDeletedTreeOnFiber(current, nearestMountedAncestor) {
    // coco 我们没有函数组件，所以是一个空函数
}

function commitPassiveUnmountEffectsInsideOfDeleteTree_complete(deletedSubtreeRoot) {
    while (nextEffect !== null) {
        const fiber = nextEffect;
        const sibling = fiber.sibling;
        const returnFiber = fiber.return;

        if (deletedTreeCleanUpLevel >= 2) {
            detachFiberAfterEffects(fiber);
            if (fiber === deletedSubtreeRoot) {
                nextEffect = null;
                return;
            }
        }

        if (sibling !== null) {
            sibling.return = returnFiber;
            nextEffect = sibling;
            return;
        }

        nextEffect = returnFiber;
    }
}

function detachFiberAfterEffects(fiber) {
    const alternate = fiber.alternate;
    if (alternate !== null) {
        fiber.alternate = null;
        detachFiberAfterEffects(alternate);
    }

    // Clear cyclical Fiber fields. This level alone is designed to roughly
    // approximate the planned Fiber refactor. In that world, `setState` will be
    // bound to a special "instance" object instead of a Fiber. The Instance
    // object will not have any of these fields. It will only be connected to
    // the fiber tree via a single link at the root. So if this level alone is
    // sufficient to fix memory issues, that bodes well for our plans.
    fiber.child = null;
    fiber.deletions = null;
    fiber.sibling = null;

    // The `stateNode` is cyclical because on host nodes it points to the host
    // tree, which has its own pointers to children, parents, and siblings.
    // The other host nodes also point back to fibers, so we should detach that
    // one, too.
    if (fiber.tag === HostComponent) {
        const hostInstance = fiber.stateNode;
        if (hostInstance !== null) {
            detachDeletedInstance(hostInstance);
        }
    }
    fiber.sibling = null;

    if (deletedTreeCleanUpLevel >= 3) {
        // Theoretically, nothing in here should be necessary, because we already
        // disconnected the fiber from the tree. So even if something leaks this
        // particular fiber, it won't leak anything else
        //
        // The purpose of this branch is to be super aggressive so we can measure
        // if there's any difference in memory impact. If there is, that could
        // indicate a React leak we don't know about.
        fiber.return = null;
        fiber.memoizedProps = null;
        fiber.memoizedState = null;
        fiber.pendingProps = null;
        fiber.stateNode = null;
        fiber.updateQueue = null;
    }
}

function safelyAttachRef(current) {
    try {
        commitAttachRef(current);
    } catch (err) {
        // captureCommitPhaseError(current, nearestMountedAncestor, error);
        console.error(err);
    }
}

function commitAttachRef(finishedWork) {
    const ref = finishedWork.ref;
    if (ref !== null) {
        const instanceToUse = finishedWork.stateNode;
        if (typeof ref === 'function') {
            ref(instanceToUse);
        } else {
            ref.current = instanceToUse;
        }
    }
}

function safelyDetachRef(current) {
    const ref = current.ref;
    if (ref !== null) {
        if (typeof ref === 'function') {
            let retVal;
            try {
                retVal = ref(null);
            } catch (err) {
                // todo captureCommitPhaseError(current, nearestMountedAncestor, error);
                console.error(err);
            }
        } else {
            ref.current = null;
        }
    }
}
