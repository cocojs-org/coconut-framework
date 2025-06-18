import {createTextNode, setInitialProperties, diffProperties, updateProperties} from "./ReactDomComponent";
import {updateFiberProps} from './ReactDomComponentTree';

export function shouldSetTextContent(type, props) {
  return (
    typeof props.children === 'string' ||
    typeof props.children === 'number'
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

export function createInstance(type, props) {
  const domElement = document.createElement(type, props);
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