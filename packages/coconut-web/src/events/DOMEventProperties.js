import { registerTwoPhaseEvent } from './EventRegistry';

export const topLevelEventsToReactNames = new Map();

const simpleEventPluginEvents = [
  'click',
  'submit',
]

function registerSimpleEvent(domEventName, reactName) {
  topLevelEventsToReactNames.set(domEventName, reactName);
  registerTwoPhaseEvent(reactName, [domEventName]);
}

export function registerSimpleEvents() {
  for (let i = 0; i < simpleEventPluginEvents.length; i++) {
    const eventName = simpleEventPluginEvents[i];
    const domEventName = eventName.toLowerCase();
    const capitalizedEvent = eventName[0].toUpperCase() + eventName.slice(1);
    registerSimpleEvent(domEventName, 'on' + capitalizedEvent);
  }
}