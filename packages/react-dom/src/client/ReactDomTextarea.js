/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { getToStringValue, toString } from './ToStringValue';

let didWarnValDefaultVal = false;

export function getHostProps(element, props) {
  const node = element;

  // Always set children to the same thing. In IE9, the selection range will
  // get reset if `textContent` is mutated.  We could add a check in setTextContent
  // to only set the value if/when the value differs from the node value (which would
  // completely solve this IE9 bug), but Sebastian+Sophie seemed to like this
  // solution. The value can be a boolean or object so that's why it's forced
  // to be a string.
  const hostProps = {
    ...props,
    value: undefined,
    defaultValue: undefined,
    children: toString(node._wrapperState.initialValue)
  }

  return hostProps;
}

export function initWrapperState(element, props) {
  const node = element;
  if (__DEV__) {

    if (
      props.value !== undefined &&
      props.defaultValue !== undefined &&
      !didWarnValDefaultVal
    ) {
      console.error(
        '%s contains a textarea with both value and defaultValue props. ' +
        'Textarea elements must be either controlled or uncontrolled ' +
        '(specify either the value prop, or the defaultValue prop, but not ' +
        'both). Decide between using a controlled or uncontrolled textarea ' +
        'and remove one of these props. More info: ' +
        'https://reactjs.org/link/controlled-components',
        'A component',
      );
      didWarnValDefaultVal = true;
    }
  }

  let initialValue = props.value;
  if (initialValue == null) {
    let {children, defaultValue} = props;
    if (children != null) {
      if (__DEV__) {
        console.error(
          'Use the `defaultValue` or `value` props instead of setting ' +
          'children on <textarea>.',
        );
      }
      if (defaultValue != null) {
        throw new Error(
          'If you supply `defaultValue` on a <textarea>, do not pass children.',
        );
      }
      if (Array.isArray(children)) {
        if (children.length > 1) {
          throw new Error('<textarea> can only have at most one child.');
        }
        children = children[0];
      }

      defaultValue = children;
    }
    if (defaultValue == null) {
      defaultValue = '';
    }
    initialValue = defaultValue;
  }

  node._wrapperState = {
    initialValue: getToStringValue(initialValue),
  }
}

export function updateWrapper(element, props) {
  const node = element;
  const value = getToStringValue(props.value);
  const defaultValue = getToStringValue(props.defaultValue);
  if (value != null) {
    const newValue = toString(value);
    if (newValue !== node.value) {
      node.value = newValue;
    }
    if (props.defaultValue == null && node.defaultValue !== newValue) {
      node.defaultValue = newValue;
    }
  }
  if (defaultValue != null) {
    node.defaultValue = toString(defaultValue);
  }
}

export function postMountWrapper(element, props) {
  const node = element;
  // This is in postMount because we need access to the DOM node, which is not
  // available until after the component has mounted.
  const textContent = node.textContent;

  // Only set node.value if textContent is equal to the expected
  // initial value. In IE10/IE11 there is a bug where the placeholder attribute
  // will populate textContent as well.
  // https://developer.microsoft.com/microsoft-edge/platform/issues/101525/
  if (textContent === node._wrapperState.initialValue) {
    if (textContent !== '' && textContent !== null) {
      node.value = textContent;
    }
  }
}

export function restoreControlledState(element, props) {
  updateWrapper(element, props);
}