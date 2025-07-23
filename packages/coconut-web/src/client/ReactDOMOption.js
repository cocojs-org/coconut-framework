/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { getToStringValue, toString } from './ToStringValue';

export function postMountWrapper(element, props) {
  if (props.value != null) {
    element.setAttribute('value', toString(getToStringValue(props.value)));
  }
}