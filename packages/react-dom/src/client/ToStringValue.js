/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import {checkFormFieldValueStringCoercion} from 'react-shared';

export function toString(value) {
  return '' + value;
}

export function getToStringValue(value) {
  switch (typeof value) {
    case 'boolean':
    case 'number':
    case 'string':
    case 'undefined':
      return value;
    case 'object':
      if (__DEV__) {
        checkFormFieldValueStringCoercion(value);
      }
      return value;
    default:
      return '';
  }
}