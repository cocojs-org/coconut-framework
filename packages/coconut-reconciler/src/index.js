import { updateContainer, createContainer, getPublicRootInstance } from './ReactFiberReconciler.js';
import { finishQueueingConcurrentUpdates } from './ReactFiberConcurrentUpdate.js';
import { classComponentUpdater } from './ReactFiberClassComponent';
import { isRenderPhase } from "./ReactFiberWorkLoop";
import {register, NAME} from "shared";
import { scheduleUpdateOnFiber, unbatchedUpdates } from "./ReactFiberWorkLoop";
import { reference } from './ReactFiberThrow';
reference();

export function updateRender(instance) {
  throw new Error("todo")
}

export { classComponentUpdater, unbatchedUpdates, updateContainer, createContainer, getPublicRootInstance, finishQueueingConcurrentUpdates, isRenderPhase }
export { registerApplication, unregisterApplication } from './coco-ioc-container/index'

register(NAME.isRenderPhase, isRenderPhase);
register(NAME.enqueueSetState, classComponentUpdater.enqueueSetState);
register(NAME.scheduleUpdateOnFiber, scheduleUpdateOnFiber);
