/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @flow
 */

import { createStack, pop, push } from './ReactFiberStack';
import { getRootHostContext, getChildHostContext} from "react-dom-ReactFiberHostConfig";

const NO_CONTEXT = {};

const contextStackCursor = createStack(NO_CONTEXT);
const contextFiberStackCursor = createStack(NO_CONTEXT);
const rootInstanceStackCursor = createStack(NO_CONTEXT);

function requiredContext(c) {
  if (c === NO_CONTEXT) {
    throw new Error(
      'Expected host context to exist. This error is likely caused by a bug ' +
      'in React. Please file an issue.',
    );
  }
  return c;
}

function getRootHostContainer() {
  const rootInstance = requiredContext(rootInstanceStackCursor.current);
  return rootInstance;
}

function pushHostContainer(fiber, nextRootInstance) {
  // Push current root instance onto the stack;
  // This allows us to reset root when portals are popped.
  push(rootInstanceStackCursor, nextRootInstance);
  // Track the context and the Fiber that provided it.
  // This enables us to pop only Fibers that provide unique contexts.
  push(contextFiberStackCursor, fiber)
  // Finally, we need to push the host context to the stack.
  // However, we can't just call getRootHostContext() and push it because
  // we'd have a different number of entries on the stack depending on
  // whether getRootHostContext() throws somewhere in renderer code or not.
  // So we push an empty value first. This lets us safely unwind on errors.
  push(contextStackCursor, NO_CONTEXT);
  const nextRootContext = getRootHostContext(nextRootInstance);
  pop(contextStackCursor)
  push(contextStackCursor, nextRootContext);
}

function popHostContainer() {
  pop(contextStackCursor);
  pop(contextFiberStackCursor);
  pop(rootInstanceStackCursor);
}

function getHostContext() {
  const context = requiredContext(contextStackCursor.current);
  return context;
}

function pushHostContext(fiber) {
  const rootInstance = requiredContext(rootInstanceStackCursor.current);
  const context = requiredContext(contextStackCursor.current);
  const nextContext = getChildHostContext(context, fiber.type, rootInstance);

  // Don't push this Fiber's context unless it's unique.
  if (context === nextContext) {
    return;
  }

  // Track the context and the Fiber that provided it.
  // This enables us to pop only Fibers that provide unique contexts.
  push(contextFiberStackCursor, fiber);
  push(contextStackCursor, nextContext);
}

function popHostContext(fiber) {
  // Do not pop unless this Fiber provided the current context.
  // pushHostContext() only pushes Fibers that provide unique contexts.
  if (contextFiberStackCursor.current !== fiber) {
    return;
  }
  pop(contextStackCursor);
  pop(contextFiberStackCursor);
}

export {
  getRootHostContainer,
  pushHostContainer,
  popHostContainer,
  getHostContext,
  pushHostContext,
  popHostContext
}