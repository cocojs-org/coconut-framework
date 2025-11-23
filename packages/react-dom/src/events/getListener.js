import { getFiberCurrentPropsFromNode } from '../client/ReactDomComponentTree';

export default function getListener(inst, registrationName) {
    const stateNode = inst.stateNode;
    if (stateNode === null) {
        return null;
    }
    const props = getFiberCurrentPropsFromNode(stateNode);
    if (props === null) {
        return null;
    }
    const listener = props[registrationName];
    if (listener && typeof listener !== 'function') {
        throw new Error(
            `Expected \`${registrationName}\` listener to be a function, instead got a value of \`${typeof listener}\` type.`
        );
    }
    return listener;
}
