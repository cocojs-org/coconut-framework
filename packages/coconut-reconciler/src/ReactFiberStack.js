/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

const valueStack = [];

let index = -1;

function createStack(defaultValue) {
  return {
    current: defaultValue
  }
}

function pop(cursor) {
  if (index < 0) {
    return;
  }
  cursor.current = valueStack[index];
  valueStack[index] = null;
  index--;
}

function push(cursor, value) {
  index++;
  valueStack[index] = cursor.current;
  cursor.current = value;
}

export {
  createStack,
  pop,
  push
}