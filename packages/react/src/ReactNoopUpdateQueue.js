/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
const didWarnStateUpdateForUnmountedComponent = {};

function warnNoop(publicInstance, callerName) {
    if (__DEV__) {
        const constructor = publicInstance.constructor;
        const componentName = (constructor && (constructor.displayName || constructor.name)) || 'Class';
        const warningKey = `${componentName}.${callerName}`;
        if (didWarnStateUpdateForUnmountedComponent[warningKey]) {
            return;
        }
        console.error(
            "Can't call %s on a component that is not yet mounted. " +
                'This is a no-op, but it might indicate a bug in your application. ' +
                'Instead, assign to `this.state` directly or define a `state = {};` ' +
                'class property with the desired state in the %s component.',
            callerName,
            componentName
        );
        didWarnStateUpdateForUnmountedComponent[warningKey] = true;
    }
}

const ReactNoopUpdateQueue = {
    isMounted() {
        return false;
    },

    /**
     * Forces an update. This should only be invoked when it is known with
     * certainty that we are **not** in a DOM transaction.
     *
     * You may want to call this when you know that some deeper aspect of the
     * component's state has changed but `setState` was not called.
     *
     * This will not invoke `shouldComponentUpdate`, but it will invoke
     * `componentWillUpdate` and `componentDidUpdate`.
     */
    enqueueForceUpdate: function (publicInstance, callback, callerName) {
        warnNoop(publicInstance, 'forceUpdate');
    },

    /**
     * Sets a subset of the state. This only exists because _pendingState is
     * internal. This provides a merging strategy that is not available to deep
     * properties which is confusing. TODO: Expose pendingState or don't use it
     * during the merge.
     */
    enqueueSetState: function (publicInstance, partialState, callback, callerName) {
        warnNoop(publicInstance, 'setState');
    },
};

export default ReactNoopUpdateQueue;
