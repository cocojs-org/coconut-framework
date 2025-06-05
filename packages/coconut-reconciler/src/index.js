import { flushSync, updateContainer, createContainer, getPublicRootInstance } from './ReactFiberReconciler.js';
import { finishQueueingConcurrentUpdates } from './ReactFiberConcurrentUpdate.js';
import { classComponentUpdater } from './ReactFiberClassComponent';
import { isRenderPhase } from "./ReactFiberWorkLoop";
import {register, NAME} from "shared";
import { scheduleUpdateOnFiber } from "./ReactFiberWorkLoop";

export function updateRender(instance) {
  throw new Error("todo")
}

export { classComponentUpdater, flushSync, updateContainer, createContainer, getPublicRootInstance, finishQueueingConcurrentUpdates, isRenderPhase }
export { registerApplication, unregisterApplication } from './coco-ioc-container/index'

register(NAME.isRenderPhase, isRenderPhase);
register(NAME.enqueueSetState, classComponentUpdater.enqueueSetState);
register(NAME.scheduleUpdateOnFiber, scheduleUpdateOnFiber);
