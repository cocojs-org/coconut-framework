import { listenToAllSupportedEvents } from '../events/DOMPluginEventSystem';
import {
  ELEMENT_NODE,
} from '../shared/HTMLNodeType';

export * from './ReactDomComponent.js'
export * from './ReactDomHostConfig.js'
import {
  batchedUpdates,
  flushSync,
  updateContainer,
  createContainer,
  getPublicRootInstance,
  findHostInstance,
  registerApplication,
  unregisterApplication
} from 'coconut-reconciler';
import { markContainerAsRoot, unmarkContainerAsRoot } from './ReactDomComponentTree';
import {setBatchingImplementation} from '../events/ReactDOMUpdateBatching';

setBatchingImplementation(
  batchedUpdates,
);

function legacyCreateRootFromDOMContainer(container, children) {
  const root = createContainer(container)
  markContainerAsRoot(root.current, container);
  container._reactRootContainer = root;

  listenToAllSupportedEvents(container);
  // Initial mount should not be batched.
  flushSync(() => {
    updateContainer(children, root, null, null);
  })
  return root;
}

function legacyRenderSubtreeIntoContainer(
  parentComponent,
  children,
  container,
  callback,
) {
  const maybeRoot = container._reactRootContainer;
  let root;
  if (!maybeRoot) {
    root = legacyCreateRootFromDOMContainer(container, children);
  } else {
    root = maybeRoot;
    updateContainer(children, root, parentComponent, callback);
  }
  return getPublicRootInstance(root);
}

export function render(element, container) {
  return legacyRenderSubtreeIntoContainer(null, element, container, null);
}

export function unmountComponentAtNode(container) {
  if (container._reactRootContainer) {
    flushSync(() => {
      legacyRenderSubtreeIntoContainer(null, null, container, () => {
        container._reactRootContainer = null;
        unmarkContainerAsRoot(container);
      });
    })
    return true;
  }

  return false;
}

export function findDOMNode(componentOrElement) {
  if (componentOrElement == null) {
    return null;
  }
  if (componentOrElement.nodeType === ELEMENT_NODE) {
    return componentOrElement;
  }
  return findHostInstance(componentOrElement);
}

export { registerApplication, unregisterApplication }
