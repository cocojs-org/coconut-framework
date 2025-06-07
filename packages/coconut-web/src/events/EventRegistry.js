/**
 * Mapping from registration name to event name
 */
export const registrationNameDependencies = {};

export const allNativeEvents = new Set();

export function registerTwoPhaseEvent(
  registrationName,
  dependencies,
) {
  registerDirectEvent(registrationName, dependencies);
  // registerDirectEvent(registrationName + 'Capture', dependencies);
}

export function registerDirectEvent(
  registrationName,
  dependencies,
) {

  registrationNameDependencies[registrationName] = dependencies;

  for (let i = 0; i < dependencies.length; i++) {
    allNativeEvents.add(dependencies[i]);
  }
}