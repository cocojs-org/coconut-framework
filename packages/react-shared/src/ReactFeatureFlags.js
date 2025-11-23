/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

// When a node is unmounted, recurse into the Fiber subtree and clean out
// references. Each level cleans up more fiber fields than the previous level.
// As far as we know, React itself doesn't leak, but because the Fiber contains
// cycles, even a single leak in product code can cause us to retain large
// amounts of memory.
//
// The long term plan is to remove the cycles, but in the meantime, we clear
// additional fields to mitigate.
//
// It's an enum so that we can experiment with different levels of
// aggressiveness.
export const deletedTreeCleanUpLevel = 3;
