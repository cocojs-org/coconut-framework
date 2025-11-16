import {
    BOOLEAN,
    getPropertyInfo,
    isAttributeNameSafe,
    shouldIgnoreAttribute,
    shouldRemoveAttribute,
} from '../shared/DOMProperty';
import dangerousStyleValue from '../shared/dangerousStyleValue';
import warnValidStyle from '../shared/warnValidStyle';
import { checkAttributeStringCoercion } from 'react-shared';

export function setValueForStyles(node, styles) {
    const style = node.style;
    for (let styleName in styles) {
        if (!styles.hasOwnProperty(styleName)) {
            continue;
        }
        const isCustomProperty = styleName.indexOf('--') === 0;
        if (__DEV__) {
            if (!isCustomProperty) {
                warnValidStyle(styleName, styles[styleName]);
            }
        }
        const styleValue = dangerousStyleValue(styleName, styles[styleName], isCustomProperty);
        if (isCustomProperty) {
            style.setProperty(styleName, styleValue);
        } else {
            style[styleName] = styleValue;
        }
    }
}

export function setValueForProperty(node, name, value, isCustomComponentTag) {
    const propertyInfo = getPropertyInfo(name);
    if (shouldIgnoreAttribute(name, propertyInfo, isCustomComponentTag)) {
        return;
    }

    if (shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag)) {
        value = null;
    }
    if (isCustomComponentTag || propertyInfo === null) {
        if (isAttributeNameSafe(name)) {
            const attributeName = name;
            if (value === null) {
                node.removeAttribute(attributeName);
            } else {
                if (__DEV__) {
                    checkAttributeStringCoercion(value, name);
                }
                node.setAttribute(attributeName, '' + value);
            }
        }
        return;
    }
    const { mustUseProperty } = propertyInfo;
    if (mustUseProperty) {
        const { propertyName } = propertyInfo;
        if (value === null) {
            const { type } = propertyInfo;
            node[propertyName] = type === BOOLEAN ? false : '';
        } else {
            node[propertyName] = value;
        }
        return;
    }
    const { attributeName, attributeNamespace } = propertyInfo;
    if (value === null) {
        node.removeAttribute(attributeName);
    } else {
        const { type } = propertyInfo;
        let attributeValue = value;
        if (type === BOOLEAN) {
            attributeValue = '';
        } else {
            if (__DEV__) {
                checkAttributeStringCoercion(value, attributeName);
                attributeValue = '' + value;
            }
        }
        if (attributeNamespace) {
            node.setAttributeNS(attributeNamespace, attributeName, attributeValue);
        } else {
            node.setAttribute(attributeName, attributeValue);
        }
    }
}
