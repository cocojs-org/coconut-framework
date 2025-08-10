import { updateContainer, createContainer, getPublicRootInstance, findHostInstance } from './ReactFiberReconciler.js';
import { finishQueueingConcurrentUpdates } from './ReactFiberConcurrentUpdate.js';
import { classComponentUpdater } from './ReactFiberClassComponent';
import { isRenderPhase } from "./ReactFiberWorkLoop";
import {register, NAME} from "shared";
import { scheduleUpdateOnFiber, flushSync, batchedUpdates } from "./ReactFiberWorkLoop";
import { reference } from './ReactFiberThrow';
reference();

export { classComponentUpdater, flushSync, batchedUpdates, updateContainer, createContainer, getPublicRootInstance, findHostInstance, finishQueueingConcurrentUpdates, isRenderPhase }
export { registerApplication, unregisterApplication } from './coco-ioc-container/index'

register(NAME.isRenderPhase, isRenderPhase);
register(NAME.scheduleUpdateOnFiber, scheduleUpdateOnFiber);
