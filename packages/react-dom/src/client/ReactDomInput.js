import { checkControlledValueProps } from '../shared/ReactControlledValuePropTypes';
import { getToStringValue, toString } from './ToStringValue';
import { assign } from 'react-shared';
import { setValueForProperty } from './DOMPropertyOperations';
import getActiveElement from './getActiveElement';
import { getFiberCurrentPropsFromNode } from './ReactDomComponentTree';
import { updateValueIfChanged } from './inputValueTracking';

let didWarnValueDefaultValue = false;
let didWarnCheckedDefaultChecked = false;
let didWarnControlledToUncontrolled = false;
let didWarnUncontrolledToControlled = false;

function isControlled(props) {
    const usesChecked = props.type === 'checkbox' || props.type === 'radio';
    return usesChecked ? props.checked != null : props.value != null;
}

export function getHostProps(element, props) {
    const node = element;
    const checked = props.checked;

    const hostProps = assign({}, props, {
        defaultChecked: undefined,
        defaultValue: undefined,
        value: undefined,
        checked: checked != null ? checked : node._wrapperState.initialChecked,
    });

    return hostProps;
}

export function initWrapperState(element, props) {
    if (__DEV__) {
        checkControlledValueProps('input', props);

        if (props.checked !== undefined && props.defaultChecked !== undefined && !didWarnCheckedDefaultChecked) {
            console.error(
                '%s contains an input of type %s with both checked and defaultChecked props. ' +
                    'Input elements must be either controlled or uncontrolled ' +
                    '(specify either the checked prop, or the defaultChecked prop, but not ' +
                    'both). Decide between using a controlled or uncontrolled input ' +
                    'element and remove one of these props. More info: ' +
                    'https://reactjs.org/link/controlled-components',
                'A component',
                props.type
            );
            didWarnCheckedDefaultChecked = true;
        }
        if (props.value !== undefined && props.defaultValue !== undefined && !didWarnValueDefaultValue) {
            console.error(
                '%s contains an input of type %s with both value and defaultValue props. ' +
                    'Input elements must be either controlled or uncontrolled ' +
                    '(specify either the value prop, or the defaultValue prop, but not ' +
                    'both). Decide between using a controlled or uncontrolled input ' +
                    'element and remove one of these props. More info: ' +
                    'https://reactjs.org/link/controlled-components',
                'A component',
                props.type
            );
            didWarnValueDefaultValue = true;
        }
    }

    const node = element;
    const defaultValue = props.defaultValue == null ? '' : props.defaultValue;

    node._wrapperState = {
        initialChecked: props.checked != null ? props.checked : props.defaultChecked,
        initialValue: getToStringValue(props.value != null ? props.value : defaultValue),
        controlled: isControlled(props),
    };
}

export function updateChecked(element, props) {
    const node = element;
    const checked = props.checked;
    if (checked != null) {
        setValueForProperty(node, 'checked', checked, false);
    }
}

export function updateWrapper(element, props) {
    const node = element;
    if (__DEV__) {
        const controlled = isControlled(props);

        if (!node._wrapperState.controlled && controlled && !didWarnUncontrolledToControlled) {
            console.error(
                'A component is changing an uncontrolled input to be controlled. ' +
                    'This is likely caused by the value changing from undefined to ' +
                    'a defined value, which should not happen. ' +
                    'Decide between using a controlled or uncontrolled input ' +
                    'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components'
            );
            didWarnUncontrolledToControlled = true;
        }
        if (node._wrapperState.controlled && !controlled && !didWarnControlledToUncontrolled) {
            console.error(
                'A component is changing a controlled input to be uncontrolled. ' +
                    'This is likely caused by the value changing from a defined to ' +
                    'undefined, which should not happen. ' +
                    'Decide between using a controlled or uncontrolled input ' +
                    'element for the lifetime of the component. More info: https://reactjs.org/link/controlled-components'
            );
            didWarnControlledToUncontrolled = true;
        }
    }

    updateChecked(element, props);

    const value = getToStringValue(props.value);
    const type = props.type;

    if (value != null) {
        if (type === 'number') {
            if ((value === 0 && node.value === '') || node.value != value) {
                node.value = toString(value);
            }
        } else if (node.value !== toString(value)) {
            node.value = toString(value);
        }
    } else if (type === 'submit' || type === 'reset') {
        // Submit/reset inputs need the attribute removed completely to avoid
        // blank-text buttons.
        node.removeAttribute('value');
        return;
    }

    if (props.hasOwnProperty('value')) {
        setDefaultValue(node, props.type, value);
    } else if (props.hasOwnProperty('defaultValue')) {
        setDefaultValue(node, props.type, getToStringValue(props.defaultValue));
    }

    // When syncing the checked attribute, it only changes when it needs
    // to be removed, such as transitioning from a checkbox into a text input
    if (props.checked == null && props.defaultChecked != null) {
        node.defaultChecked = !!props.defaultChecked;
    }
}

export function postMountWrapper(element, props) {
    const node = element;
    if (props.hasOwnProperty('value') || props.hasOwnProperty('defaultValue')) {
        const type = props.type;
        const isButton = type === 'submit' || type === 'reset';
        if (isButton && (props.value === undefined || props.value === null)) {
            return;
        }

        const initialValue = toString(node._wrapperState.initialValue);
        if (initialValue !== node.value) {
            node.value = initialValue;
        }
        // Otherwise, the value attribute is synchronized to the property,
        // so we assign defaultValue to the same thing as the value property
        // assignment step above.
        node.defaultValue = initialValue;
    }

    const name = node.name;
    if (name !== '') {
        node.name = '';
    }

    // When syncing the checked attribute, both the checked property and
    // attribute are assigned at the same time using defaultChecked. This uses:
    //
    //   1. The checked React property when present
    //   2. The defaultChecked React property when present
    //   3. Otherwise, false
    node.defaultChecked = !node.defaultChecked;
    node.defaultChecked = !!node._wrapperState.initialChecked;

    if (name !== '') {
        node.name = name;
    }
}

export function restoreControlledState(element, props) {
    const node = element;
    updateWrapper(node, props);
    updateNamedCousins(node, props);
}

function updateNamedCousins(rootNode, props) {
    const name = props.name;
    if (props.type === 'radio' && name != null) {
        let queryRoot = rootNode;

        while (queryRoot.parentNode) {
            queryRoot = queryRoot.parentNode;
        }

        // If `rootNode.form` was non-null, then we could try `form.elements`,
        // but that sometimes behaves strangely in IE8. We could also try using
        // `form.getElementsByName`, but that will only return direct children
        // and won't include inputs that use the HTML5 `form=` attribute. Since
        // the input might not even be in a form. It might not even be in the
        // document. Let's just use the local `querySelectorAll` to ensure we don't
        // miss anything.
        const group = queryRoot.querySelectorAll('input[name=' + JSON.stringify('' + name) + '][type="radio"]');

        for (let i = 0; i < group.length; i++) {
            const otherNode = group[i];
            if (otherNode === rootNode || otherNode.form !== rootNode.form) {
                continue;
            }
            // This will throw if radio buttons rendered by different copies of React
            // and the same name are rendered into the same form (same as #1939).
            // That's probably okay; we don't support it just as we don't support
            // mixing React radio buttons with non-React ones.
            const otherProps = getFiberCurrentPropsFromNode(otherNode);

            if (!otherProps) {
                throw new Error(
                    'ReactDOMInput: Mixing React and non-React radio inputs with the ' + 'same `name` is not supported.'
                );
            }

            // We need update the tracked value on the named cousin since the value
            // was changed but the input saw no event or value set
            updateValueIfChanged(otherNode);

            // If this is a controlled radio button group, forcing the input that
            // was previously checked to update will cause it to be come re-checked
            // as appropriate.
            updateWrapper(otherNode, otherProps);
        }
    }
}

// In Chrome, assigning defaultValue to certain input types triggers input validation.
// For number inputs, the display value loses trailing decimal points. For email inputs,
// Chrome raises "The specified value <x> is not a valid email address".
//
// Here we check to see if the defaultValue has actually changed, avoiding these problems
// when the user is inputting text
//
// https://github.com/facebook/react/issues/7253
export function setDefaultValue(node, type, value) {
    if (type !== 'number' || getActiveElement(node.ownerDocument) !== node) {
        if (value == null) {
            node.defaultValue = toString(node._wrapperState.initialValue);
        } else if (node.defaultValue !== toString(value)) {
            node.defaultValue = toString(value);
        }
    }
}
