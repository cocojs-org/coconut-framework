import { updateContainer, createContainer, getPublicRootInstance, findHostInstance } from './ReactFiberReconciler.js';
import { finishQueueingConcurrentUpdates } from './ReactFiberConcurrentUpdate.js';
import { classComponentUpdater } from './ReactFiberClassComponent';
import {register, NAME} from "shared";
import { scheduleUpdateOnFiber, flushSync, batchedUpdates } from "./ReactFiberWorkLoop";
import { reference } from './ReactFiberThrow';
reference();

export { classComponentUpdater, flushSync, batchedUpdates, updateContainer, createContainer, getPublicRootInstance, findHostInstance, finishQueueingConcurrentUpdates }
export { registerApplication, unregisterApplication } from './coco-mvc/application.js'

register(NAME.scheduleUpdateOnFiber, scheduleUpdateOnFiber);
