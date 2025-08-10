import {
  createUpdate,
  enqueueUpdate,
  ForceUpdate,
  initializeUpdateQueue,
  processUpdateQueue,
} from './ReactFiberClassUpdateQueue';
import {get, NAME} from "shared";
import { Update } from "./ReactFiberFlags";
import { getApplication } from './coco-ioc-container/index';
import { isMounted } from './ReactFiberTreeReflection';

let didWarnAboutDirectlyAssigningPropsToState;
if (__DEV__) {
  didWarnAboutDirectlyAssigningPropsToState = new Set();
}

/**
 * classComponentUpdater
 * @type {{
 *   isMounted: (component: any)=> boolean,
 *   enqueueUpdate: (inst: any, field: string, payload: any, callback: any) => void
 * }}
 */
const classComponentUpdater = {
  isMounted,
  enqueueSetState(inst, field, payload, callback) {
    const fiber = inst._reactInternals; // const fiber = getInstance(inst)

    const update = createUpdate(field);
    update.payload = payload;
    const root = enqueueUpdate(fiber, update);
    if (root !== null) {
      const scheduleUpdateOnFiber = get(NAME.scheduleUpdateOnFiber);
      if (scheduleUpdateOnFiber) {
        scheduleUpdateOnFiber(root, fiber);
      }
    }
  }
}

function adoptClassInstance(workInProgress, instance) {
  instance.updater = classComponentUpdater;
  workInProgress.stateNode = instance;
  instance._reactInternals = workInProgress; // setInstance(instance, workInProgress);
}

function constructClassInstance(workInProgress, ctor, props) {
  const application = getApplication();
  const instance = application.getComponent(ctor, {constructorParams: [props]});
  const Reactive = application.getMetadataCls('Reactive');
  const fields = application.listFieldByMetadataCls(ctor, Reactive, true);
  workInProgress.memoizedState = fields.reduce((prev, field) => {
    prev[field] = instance[field];
    return prev;
  }, {})
  adoptClassInstance(workInProgress, instance);

  return instance;
}

function mountClassInstance(
  workInProgress,
  ctor,
  newProps
) {
  const instance = workInProgress.stateNode;
  instance.props = newProps;

  initializeUpdateQueue(workInProgress)

  if (__DEV__) {
    const application = getApplication();
    if (!application) {
      console.error("没有注入application");
      return;
    }
    const Reactive = application.getMetadataCls('Reactive');
    const fields = application.listFieldByMetadataCls(ctor, Reactive, true);
    for (const field of fields) {
      if (instance[field] === newProps) {
        const componentName = ctor.name || 'Component';
        if (!didWarnAboutDirectlyAssigningPropsToState.has(componentName)) {
          didWarnAboutDirectlyAssigningPropsToState.add(componentName);
          console.error(
            '%s: It is not recommended to assign props directly to state ' +
            "because updates to props won't be reflected in state. " +
            'In most cases, it is better to use props directly.',
            componentName,
          );
        }
      }
    }
  }
  if (typeof instance.viewDidMount === 'function') {
    workInProgress.flags |= Update;
  }
}

function updateClassInstance(
  current,
  workInProgress,
  ctor,
  newProps
) {
  const instance = workInProgress.stateNode;
  const oldState = workInProgress.memoizedState;
  let newState = oldState
  processUpdateQueue(workInProgress, newProps, instance);
  newState = workInProgress.memoizedState;

  instance.props = newProps;
  const application = getApplication();
  const Reactive = application.getMetadataCls('Reactive');
  const fields = application.listFieldByMetadataCls(ctor, Reactive, true);
  for (const field of fields) {
    instance[field] = newState[field]
  }

  // todo 新旧state对比，新旧props对比，判断是否需要update

  if (typeof instance.viewDidUpdate === 'function') {
    workInProgress.flags |= Update;
  }

  return true;
}

export {
  classComponentUpdater,
  constructClassInstance,
  mountClassInstance,
  updateClassInstance
}