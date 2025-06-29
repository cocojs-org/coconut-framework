import {scheduleUpdateOnFiber} from "./ReactFiberWorkLoop";
import {createFiberRoot} from "./ReactFiberRoot";
import {createUpdate, enqueueUpdate} from "./ReactFiberClassUpdateQueue";
import { HostComponent } from './ReactWorkTags';
import { findCurrentHostFiber } from './ReactFiberTreeReflection';


export function createContainer(
  container
) {
  return createFiberRoot(container)
}

export function updateContainer(
  element,
  container,
) {
  const current = container.current;

  const update = createUpdate();
  update.payload = {element};

  const root = enqueueUpdate(current, update)
  if (root !== null) {
    scheduleUpdateOnFiber(root, current);
  }
}

export function findHostInstance(component) {
  const fiber = component._reactInternals; // const fiber = getInstance(inst)
  if (fiber === undefined) {
    if (typeof component.render === 'function') {
      throw new Error('Unable to find node on an unmounted component.');
    } else {
      const keys = Object.keys(component).join(',');
      throw new Error(
        `Argument appears to not be a ReactComponent. Keys: ${keys}`,
      );
    }
  }
  const hostFiber = findCurrentHostFiber(fiber);
  if (hostFiber === null) {
    return null;
  }
  return hostFiber.stateNode;
}

export function getPublicRootInstance(
  container,
) {
  const containerFiber = container.current;
  if (!containerFiber.child) {
    return null;
  }
  switch (containerFiber.child.tag) {
    case HostComponent:
      return containerFiber.child.stateNode;
    default:
      return containerFiber.child.stateNode;
  }
}