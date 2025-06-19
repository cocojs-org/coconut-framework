import { getPropertyInfo, shouldIgnoreAttribute, shouldRemoveAttribute } from '../shared/DOMProperty';
import dangerousStyleValue from '../shared/dangerousStyleValue';

export function setValueForStyles(node, styles) {
  const style = node.style;
  for (let styleName in styles) {
    if (!styles.hasOwnProperty(styleName)) {
      continue;
    }
    const isCustomProperty = styleName.indexOf('--') === 0;
    const styleValue = dangerousStyleValue(
      styleName,
      styles[styleName],
      isCustomProperty,
    );
    if (isCustomProperty) {
      style.setProperty(styleName, styleValue);
    } else {
      style[styleName] = styleValue;
    }
  }
}

export function setValueForProperty(
  node,
  name,
  value,
  isCustomComponentTag,
  oldValue,
) {
  const propertyInfo = getPropertyInfo(name);
  if (shouldIgnoreAttribute(name, propertyInfo)) {
    return;
  }

  if (shouldRemoveAttribute(name, value, propertyInfo, isCustomComponentTag)) {
    value = null;
  }
  if(propertyInfo === null) {
    const attributeName = name;
    if (value === null) {
      node.removeAttribute(attributeName);
    } else {
      node.setAttribute(attributeName, '' + value);
    }
    return;
  }
  const { attributeName } = propertyInfo;
  if (value === null) {
    node.removeAttribute(attributeName)
  } else {
    let attributeValue = value;
    node.setAttribute(attributeName, attributeValue)
  }
}