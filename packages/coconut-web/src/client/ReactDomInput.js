import { checkControlledValueProps } from '../shared/ReactControlledValuePropTypes';
import { getToStringValue, toString } from './ToStringValue';
import { assign } from "shared";

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

export function updateWrapper(element, props) {
  const node = element;
  const value = getToStringValue(props.value);
  const type = props.type;

  if (value != null) {
    if (node.value !== toString(value)) {
      node.value = toString(value);
    }
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