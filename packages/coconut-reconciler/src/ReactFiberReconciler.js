import {scheduleUpdateOnFiber} from "./ReactFiberWorkLoop";
import {createFiberRoot} from "./ReactFiberRoot";
import {createUpdate, enqueueUpdate} from "./ReactFiberClassUpdateQueue";
import { HostComponent } from './ReactWorkTags';


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