import { checkControlledValueProps } from '../shared/ReactControlledValuePropTypes';
import { getToStringValue, toString } from './ToStringValue';
import { assign } from "shared";
import { setValueForProperty } from './DOMPropertyOperations';
import getActiveElement from './getActiveElement';

let didWarnControlledToUncontrolled = false;

function isControlled(props) {
  const usesChecked = props.type === 'checkbox' || props.type === 'radio';
  return usesChecked ? props.checked != null : props.value != null;
}

export function getHostProps(element, props) {
  const node = element;
  const checked = props.checked;

  const hostProps = assign({}, props, {
    defaultChecked: undefined,
    defaultValue: undefined,
    value: undefined,
    checked: checked != null ? checked : node._wrapperState.initialChecked,
  });

  return hostProps;
}

export function initWrapperState(element, props) {
  if (__DEV__) {
    checkControlledValueProps('input', props);
  }

  const node = element;
  const defaultValue = props.defaultValue == null ? '' : props.defaultValue;

  node._wrapperState = {
    initialChecked: props.checked !== null ? props.checked : props.defaultValue,
    initialValue: getToStringValue(props.value != null ? props.value : defaultValue),
    controlled: isControlled(props)
  }
}

export function updateChecked(element, props) {
  const node = element;
  const checked = props.checked;
  if (checked != null) {
    setValueForProperty(node, 'checked', checked, false);
  }
}

export function updateWrapper(element, props) {
  const node = element;
  if (__DEV__) {
    const controlled = isControlled(props);
    if (
      node._wrapperState.controlled &&
      !controlled &&
      !didWarnControlledToUncontrolled
    ) {
      console.error(
        'A component is changing a controlled input to be uncontrolled. ' +
        'This is likely caused by the value changing from a defined to ' +
        'undefined, which should not happen. ' +
        'Decide between using a controlled or uncontrolled input ' +
        'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components',
      );
      didWarnControlledToUncontrolled = true;
    }
  }

  updateChecked(element, props);

  const value = getToStringValue(props.value);
  const type = props.type;

  if (value != null) {
    if (type === 'number') {
      if (
        (value === 0 && node.value === '') ||
        node.value != value
      ) {
        node.value = toString(value);
      }
    } else if (node.value !== toString(value)) {
      node.value = toString(value);
    }
  } else if (type === 'submit' || type === 'reset') {
    // Submit/reset inputs need the attribute removed completely to avoid
    // blank-text buttons.
    node.removeAttribute('value');
    return;
  }

  if (props.hasOwnProperty('value')) {
    setDefaultValue(node, props.type, value);
  } else if (props.hasOwnProperty('defaultValue')) {
    setDefaultValue(node, props.type, getToStringValue(props.defaultValue));
  }
}

export function postMountWrapper(
  element,
  props,
) {
  const node = element;
  if (props.hasOwnProperty('value') || props.hasOwnProperty('defaultValue')) {
    const type = props.type;
    const isButton = type === 'submit' || type === 'reset';
    if (isButton && (props.value === undefined || props.value === null)) {
      return;
    }

    const initialValue = toString(node._wrapperState.initialValue);
    if (initialValue !== node.value) {
      node.value = initialValue;
    }
    node.defaultValue = initialValue;
  }
}

export function restoreControlledState(element, props) {
  const node = element;
  updateWrapper(node, props);
}

export function setDefaultValue(
  node,
  type,
  value
) {
  if (
    type !== 'number' ||
    getActiveElement(node.ownerDocument) !== node
  ) {
    if (value == null) {
      node.defaultValue = toString(node._wrapperState.initialValue);
    } else if (node.defaultValue !== toString(value)) {
      node.defaultValue = toString(value);
    }
  }
}