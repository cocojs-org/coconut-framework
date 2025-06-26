import { listenToAllSupportedEvents } from '../events/DOMPluginEventSystem';

export * from './ReactDomComponent.js'
export * from './ReactDomHostConfig.js'
import {unbatchedUpdates, updateContainer, createContainer, getPublicRootInstance, registerApplication, unregisterApplication} from 'coconut-reconciler';

function legacyCreateRootFromDOMContainer(container, children) {
  const root = createContainer(container)
  container._reactRootContainer = root;

  listenToAllSupportedEvents(container);
  // Initial mount should not be batched.
  unbatchedUpdates(() => {
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
    unbatchedUpdates(() => {
      updateContainer(children, root, parentComponent, callback);
    })
  }
  return getPublicRootInstance(root);
}

export function render(element, container) {
  return legacyRenderSubtreeIntoContainer(null, element, container, null);
}

export function unmountComponentAtNode(container) {
  if (container._reactRootContainer) {
    unbatchedUpdates(() => {
      legacyRenderSubtreeIntoContainer(null, null, container, () => {
        container._reactRootContainer = null;
      });
    })
    return true;
  }

  return false;
}

export { registerApplication, unregisterApplication }
