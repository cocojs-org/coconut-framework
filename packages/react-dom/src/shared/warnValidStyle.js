/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */

let warnValidStyle = () => {};

if (__DEV__) {
  let warnedForNaNValue = false;

  warnValidStyle = function(name, value) {
    const warnStyleValueIsNaN = function(name, value) {
      if (warnedForNaNValue) {
        return;
      }

      warnedForNaNValue = true;
      console.error(
        '`NaN` is an invalid value for the `%s` css style property.',
        name,
      );
    };
    if (typeof value === 'number') {
      if (isNaN(value)) {
        warnStyleValueIsNaN(name, value);
      }
    }
  }
}

export default warnValidStyle;
