import {ClassComponent, HostComponent, HostRoot, HostText} from "./ReactWorkTags";
import { LayoutMask, MutationMask, NoFlags, Placement, Ref, Update } from './ReactFiberFlags';
import {
  commitTextUpdate,
  commitUpdate,
  removeChild,
  removeChildFromContainer,
  commitMount,
} from "ReactFiberHostConfig";

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
const callComponentWillUnmountWithTimer = function(current, instance) {
  instance.viewWillUnmount();
};

function safelyCallComponentWillUnmount(
  current,
  nearestMountedAncestor,
  instance,
) {
  callComponentWillUnmountWithTimer(current, instance);
}

function insertOrAppendPlacementNodeIntoContainer(node, before, parent) {
  const tag = node.tag;
  const isHost = tag === HostComponent || tag === HostText;
  if (isHost) {
    const stateNode = node.stateNode;
    if (before) {
      parent.insertBefore(stateNode, before)
    } else {
      parent.appendChild(stateNode)
    }
  } else {
    const child = node.child;
    if (child !== null) {
      insertOrAppendPlacementNodeIntoContainer(child, before, parent)
      let sibling = child.sibling;
      while (sibling !== null) {
        insertOrAppendPlacementNodeIntoContainer(sibling, before, parent)
        sibling = sibling.sibling
      }
    }
    throw new Error('todo')
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
  findParent: while(parent !== null) {
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
      'Expected to find a host parent. This error is likely caused by ' +
      'a bug in React. Please file an issue.',
    );
  }
  commitDeletionEffectsOnFiber(root, returnFiber, deletedFiber);
  hostParent = null;
  hostParentIsContainer = false;

  detachFiberMutation(deletedFiber)
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
      const instance = deletedFiber.stateNode;
      if (typeof instance.viewWillUnmount === 'function') {
        safelyCallComponentWillUnmount(
          deletedFiber,
          nearestMountedAncestor,
          instance
        )
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
    'Expected to find a host parent. This error is likely caused by a bug ' +
    'in React. Please file an issue.'
  )
}

function commitPlacement(finishedWork) {
  const parentFiber = getHostParentFiber(finishedWork);
  switch (parentFiber.tag) {
    case HostComponent: {
      const parent = parentFiber.stateNode;
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent)
      break;
    }
    case HostRoot: {
      const parent = parentFiber.stateNode.containerInfo;
      const before = getHostSibling(finishedWork);
      insertOrAppendPlacementNodeIntoContainer(finishedWork, before, parent)
      break;
    }
  }
}

function recursivelyTraverseMutationEffects(root, parentFiber) {
  const deletions = parentFiber.deletions;
  if (deletions !== null) {
    for (let i = 0; i < deletions.length; i++) {
      commitDeletionEffects(root, parentFiber, deletions[i]);
    }
  }
  if (parentFiber.subtreeFlags & MutationMask) {
    let child = parentFiber.child;
    while (child !== null) {
      commitMutationEffectsOnFiber(child, root)
      child = child.sibling
    }
  }
}

function commitReconciliationEffects(finishedWork) {
  const flags = finishedWork.flags;
  if (flags & Placement) {
    try {
      commitPlacement(finishedWork)
    } catch (e) {

    }
    finishedWork.flags &= ~Placement
  }
}
function commitMutationEffectsOnFiber(
  finishedWork,
  root
) {
  const current = finishedWork.alternate;
  const flags = finishedWork.flags;
  switch (finishedWork.tag) {
    case HostComponent: {
      recursivelyTraverseMutationEffects(root, finishedWork)
      commitReconciliationEffects(finishedWork)

      if (flags & Update) {
        const instance = finishedWork.stateNode;
        if (instance !== null) {
          const newProps = finishedWork.memoizedProps;
          const oldProps = current !== null ? current.memoizedProps : newProps;
          const type = finishedWork.type;
          const updatePayload = finishedWork.updateQueue;
          finishedWork.updateQueue = null;
          if (updatePayload !== null) {
            commitUpdate(
              instance,
              updatePayload,
              type,
              oldProps,
              newProps
            )
          }
        }
      }
      return;
    }
    case HostRoot: {
      recursivelyTraverseMutationEffects(root, finishedWork)
      commitReconciliationEffects(finishedWork)
      return
    }
    case ClassComponent: {
      recursivelyTraverseMutationEffects(root, finishedWork)
      commitReconciliationEffects(finishedWork)
      return
    }
    case HostText: {
      recursivelyTraverseMutationEffects(root, finishedWork)
      commitReconciliationEffects(finishedWork)

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

export function commitMutationEffects(
  root,
  finishedWork
) {
  commitMutationEffectsOnFiber(finishedWork, root)
}

export function commitLayoutEffects(
  finishedWork,
  root
) {
  inProgressRoot = root;
  nextEffect = finishedWork;

  commitLayoutEffects_begin(finishedWork, root)

  inProgressRoot = null;
}

function commitLayoutEffects_begin(
  subtreeRoot,
  root
) {
  while (nextEffect !== null) {
    const fiber = nextEffect;
    const firstChild = fiber.child;

    if ((fiber.subtreeFlags & LayoutMask) !== NoFlags && firstChild !== null) {
      firstChild.return = fiber;
      nextEffect = firstChild;
    } else {
      commitLayoutMountEffects_complete(subtreeRoot, root)
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

function commitLayoutEffectOnFiber(
  finishedRoot,
  current,
  finishedWork
) {
  if ((finishedWork.flags & LayoutMask) !== NoFlags) {
    switch(finishedWork.tag) {
      case ClassComponent: {
        const instance = finishedWork.stateNode;
        if (finishedWork.flags & Update) {
          if (current === null) {
            instance.viewDidMount();
          } else {
            const prevProps = current.memoizedProps;
            const prevState = current.memoizedState;
            instance.viewDidUpdate(
              prevProps,
              prevState
            )
          }
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
    commitAttachRef(finishedWork)
  }
}

function commitAttachRef(finishedWork) {
  const ref = finishedWork.ref;
  if (ref !== null) {
    const instanceToUse = finishedWork.stateNode;
    if (typeof ref === 'function') {
      ref(instanceToUse)
    } else {
      ref.current = instanceToUse;
    }
  }
}