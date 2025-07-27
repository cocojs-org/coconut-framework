/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { Children } from 'coco-react';
import { getToStringValue, toString } from './ToStringValue';

let didWarnSelectedSetOnOption = false;
let didWarnInvalidChild = false;
let didWarnInvalidInnerHTML = false;

export function validateProps(element, props) {
  if (__DEV__) {
    if (props.value == null) {
      if (typeof props.children === 'object' && props.children !== null) {
        Children.forEach(props.children, function(child) {
          if (child == null) {
            return;
          }
          if (typeof child === 'string' || typeof child === 'number') {
            return;
          }
          if (!didWarnInvalidChild) {
            didWarnInvalidChild = true;
            console.error(
              'Cannot infer the option value of complex children. ' +
              'Pass a `value` prop or use a plain string as children to <option>.',
            );
          }
        });
      } else if (props.dangerouslySetInnerHTML != null) {
        if (!didWarnInvalidInnerHTML) {
          didWarnInvalidInnerHTML = true;
          console.error(
            'Pass a `value` prop if you set dangerouslyInnerHTML so React knows ' +
            'which value should be selected.',
          );
        }
      }
    }

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