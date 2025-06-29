import {
  createTextNode,
  setInitialProperties,
  diffProperties,
  updateProperties,
  createElement,
} from './ReactDomComponent';
import {updateFiberProps} from './ReactDomComponentTree';
import setTextContent from './setTextContent';
import { getChildNamespace, getIntrinsicNamespace, HTML_NAMESPACE } from '../shared/DOMNamespaces';
import { validateDOMNesting, updatedAncestorInfo } from './validateDOMNesting';
import { COMMENT_NODE, DOCUMENT_NODE } from '../shared/HTMLNodeType';

export function shouldSetTextContent(type, props) {
  return (
    typeof props.children === 'string' ||
    typeof props.children === 'number' ||
    (typeof props.dangerouslySetInnerHTML === 'object' &&
      props.dangerouslySetInnerHTML !== null &&
      props.dangerouslySetInnerHTML.__html != null)
  );
}

export function prepareUpdate(
  domElement,
  type,
  oldProps,
  newProps
) {
  return diffProperties(
    domElement,
    type,
    oldProps,
    newProps
  )
}

export function createTextInstance(
  text
) {
  const textNode = createTextNode(text);
  return textNode;
}

export function commitTextUpdate(
  textInstance,
  oldText,
  newText
) {
  textInstance.nodeValue = newText;
}

export function commitUpdate(
  domElement,
  updatePayload,
  type,
  oldProps,
  newProps
) {
  updateProperties(domElement, updatePayload, type, oldProps, newProps);
  updateFiberProps(domElement, newProps);
}

export function createInstance(
  type,
  props,
  hostContext
) {
  if (__DEV__) {
    const hostContextDev = hostContext;
    validateDOMNesting(type, null, hostContextDev.ancestorInfo);
  }
  const domElement = createElement(
    type,
    props,
    HTML_NAMESPACE, // 先写死，后续扩展
  );
  updateFiberProps(domElement, props);
  return domElement;
}

export function finalizeInitialChildren(domElement, type, props) {
  setInitialProperties(domElement, type, props);
  switch (type) {
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      return !!props.autoFocus;
    case 'img':
      return true;
    default:
      return false;
  }
}

export function removeChild(
  parentInstance,
  child,
) {
  parentInstance.removeChild(child);
}

export function removeChildFromContainer(
  container,
  child,
) {
  container.removeChild(child);
}

export function commitMount(
  domElement,
  type,
  newProps
) {
  switch (type) {
    case 'button':
    case 'input':
    case 'select':
    case 'textarea':
      if (newProps.autoFocus) {
        domElement.focus();
      }
      return;
  }
}

export function resetTextContent(domElement) {
  setTextContent(domElement, '');
}

export function getRootHostContext(rootContainerInstance) {
  let type;
  let namespace;
  const nodeType = rootContainerInstance.nodeType;
  switch (nodeType) {
    case DOCUMENT_NODE: {
      type = '#document';
      const root = rootContainerInstance.documentElement;
      namespace = root ? root.namespaceURI : getChildNamespace(null, '');
      break;
    }
    default: {
      const container =
        nodeType === COMMENT_NODE
          ? rootContainerInstance.parentNode
          : rootContainerInstance;
      const ownNamespace = container.namespaceURI || null;
      type = container.tagName;
      namespace = getChildNamespace(ownNamespace, type);
      break;
    }
  }
  if (__DEV__) {
    const validatedTag = type.toLowerCase();
    const ancestorInfo = updatedAncestorInfo(null, validatedTag);
    return {namespace, ancestorInfo};
  }
  return namespace;
}

export function getChildHostContext(
  parentHostContext,
  type
) {
  if (__DEV__) {
    const parentHostContextDev = parentHostContext;
    const namespace = getChildNamespace(parentHostContextDev.namespace, type);
    const ancestorInfo = updatedAncestorInfo(
      parentHostContextDev.ancestorInfo,
      type,
    );
    return {namespace, ancestorInfo};
  }
  const parentNamespace = parentHostContext;
  return getChildNamespace(parentHostContext, type);
}