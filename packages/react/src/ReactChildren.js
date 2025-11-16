/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */
import { REACT_ELEMENT_TYPE } from 'react-shared';
import { cloneAndReplaceKey, isValidElement } from './ReactElement';

const SEPARATOR = '.';
const SUBSEPARATOR = ':';

function escape(key) {
    const escapeRegex = /[=:]/g;
    const escaperLookup = {
        '=': '=0',
        ':': '=2',
    };
    const escapedString = key.replace(escapeRegex, function (match) {
        return escaperLookup[match];
    });

    return '$' + escapedString;
}

const userProvidedKeyEscapeRegex = /\/+/g;
function escapeUserProvidedKey(text) {
    return text.replace(userProvidedKeyEscapeRegex, '$&/');
}

function getElementKey(element, index) {
    // Do some typechecking here since we call this blindly. We want to ensure
    // that we don't block potential future ES APIs.
    if (typeof element === 'object' && element !== null && element.key != null) {
        return escape('' + element.key);
    }
    // Implicit key determined by the index in the set
    return index.toString(36);
}

function mapIntoArray(children, array, escapedPrefix, nameSoFar, callback) {
    const type = typeof children;
    if (type === 'undefined' || type === 'boolean') {
        children = null;
    }

    let invokeCallback = false;
    if (children === null) {
        invokeCallback = true;
    } else {
        switch (type) {
            case 'string':
            case 'number':
                invokeCallback = true;
                break;
            case 'object':
                switch (children.$$typeof) {
                    case REACT_ELEMENT_TYPE:
                        invokeCallback = true;
                }
        }
    }

    if (invokeCallback) {
        const child = children;
        let mappedChild = callback(child);
        const childKey = nameSoFar === '' ? SEPARATOR + getElementKey(child, 0) : nameSoFar;
        if (Array.isArray(mappedChild)) {
            let escapedChildKey = '';
            if (childKey != null) {
                escapedChildKey = escapeUserProvidedKey(childKey) + '/';
            }
            mapIntoArray(mappedChild, array, escapedChildKey, '', (c) => c);
        } else if (mappedChild != null) {
            if (isValidElement(mappedChild)) {
                mappedChild = cloneAndReplaceKey(
                    mappedChild,
                    escapedPrefix +
                        // $FlowFixMe Flow incorrectly thinks React.Portal doesn't have a key
                        (mappedChild.key && (!child || child.key !== mappedChild.key)
                            ? // $FlowFixMe Flow incorrectly thinks existing element's key can be a number
                              // eslint-disable-next-line react-internal/safe-string-coercion
                              escapeUserProvidedKey('' + mappedChild.key) + '/'
                            : '') +
                        childKey
                );
            }
            array.push(mappedChild);
        }
        return 1;
    }

    let child;
    let nextName;
    let subtreeCount = 0;
    const nextNamePrefix = nameSoFar === '' ? SEPARATOR : nameSoFar + SUBSEPARATOR;

    if (Array.isArray(children)) {
        for (let i = 0; i < children.length; i++) {
            child = children[i];
            nextName = nextNamePrefix + getElementKey(child, i);
            subtreeCount += mapIntoArray(child, array, escapedPrefix, nextName, callback);
        }
    } else {
        if (type === 'object') {
            const childrenString = String(children);
            throw new Error(
                `Objects are not valid as a React child (found: ${
                    childrenString === '[object Object]'
                        ? 'object with keys {' + Object.keys(children).join(', ') + '}'
                        : childrenString
                }). ` +
                    'If you meant to render a collection of children, use an array ' +
                    'instead.'
            );
        }
    }

    return subtreeCount;
}

function mapChildren(children, func, context) {
    if (children == null) {
        return children;
    }
    const result = [];
    let count = 0;
    mapIntoArray(children, result, '', '', function (child) {
        return func.call(context, child, count++);
    });
    return result;
}

function forEachChildren(children, forEachFunc, forEachContext) {
    mapChildren(
        children,
        function () {
            forEachFunc.apply(this, arguments);
            // Don't return anything.
        },
        forEachContext
    );
}

export { forEachChildren as forEach, mapChildren as map };
