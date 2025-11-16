/**
 * Mapping from registration name to event name
 */
export const registrationNameDependencies = {};

/**
 * Mapping from lowercase registration names to the properly cased version,
 * used to warn in the case of missing event handlers. Available
 * only in __DEV__.
 * @type {Object}
 */
export const possibleRegistrationNames = __DEV__ ? {} : null;

export const allNativeEvents = new Set();

export function registerTwoPhaseEvent(registrationName, dependencies) {
    registerDirectEvent(registrationName, dependencies);
    // registerDirectEvent(registrationName + 'Capture', dependencies);
}

export function registerDirectEvent(registrationName, dependencies) {
    registrationNameDependencies[registrationName] = dependencies;

    if (__DEV__) {
        const lowerCasedName = registrationName.toLowerCase();
        possibleRegistrationNames[lowerCasedName] = registrationName;

        if (registrationName === 'onDoubleClick') {
            possibleRegistrationNames.ondblclick = registrationName;
        }
    }

    for (let i = 0; i < dependencies.length; i++) {
        allNativeEvents.add(dependencies[i]);
    }
}
