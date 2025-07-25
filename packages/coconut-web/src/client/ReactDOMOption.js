/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { getToStringValue, toString } from './ToStringValue';

let didWarnSelectedSetOnOption = false;

export function validateProps(element, props) {
  if (__DEV__) {
    if (props.selected != null && !didWarnSelectedSetOnOption) {
      console.error(
        'Use the `defaultValue` or `value` props on <select> instead of ' +
        'setting `selected` on <option>.',
      )
      didWarnSelectedSetOnOption = true;
    }
  }
}

export function postMountWrapper(element, props) {
  if (props.value != null) {
    element.setAttribute('value', toString(getToStringValue(props.value)));
  }
}