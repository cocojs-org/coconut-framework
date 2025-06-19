import isCustomComponent from './isCustomComponent';
import { getPropertyInfo, shouldRemoveAttributeWithWarning } from './DOMProperty';

let validateProperty = () => {};

if (__DEV__) {
  validateProperty = function(tagName, name, value, eventRegistry) {
    const propertyInfo = getPropertyInfo(name);
    if (
      typeof value === 'boolean' &&
      shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)
    ) {
      if (value) {
        console.error(
          'Received `%s` for a non-boolean attribute `%s`.\n\n' +
          'If you want to write it to the DOM, pass a string instead: ' +
          '%s="%s" or %s={value.toString()}.',
          value,
          name,
          name,
          value,
          name,
        );
      }
      return true;
    }

    if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
      return false;
    }

    return true;
  }
}

const warnUnknownProperties = function(type, props, eventRegistry) {
  if (__DEV__) {
    const unknownProps = [];
    for (const key in props) {
      const isValid = validateProperty(type, key, props[key], eventRegistry);
      if (!isValid) {
        unknownProps.push(key);
      }
    }
  }
}
export function validateProperties(type, props, eventRegistry) {
  if (isCustomComponent(type, props)) {
    return;
  }
  warnUnknownProperties(type, props, eventRegistry);
}