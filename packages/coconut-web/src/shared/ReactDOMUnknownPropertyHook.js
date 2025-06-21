import isCustomComponent from './isCustomComponent';
import { getPropertyInfo, shouldRemoveAttributeWithWarning } from './DOMProperty';

let validateProperty = () => {};

if (__DEV__) {
  validateProperty = function(tagName, name, value, eventRegistry) {

    if (eventRegistry !== null) {
      const lowerCasedName = name.toLowerCase();
      const {
        registrationNameDependencies,
        possibleRegistrationNames,
      } = eventRegistry;
      if (registrationNameDependencies.hasOwnProperty(name)) {
        return true;
      }
      const registrationName = possibleRegistrationNames.hasOwnProperty(
        lowerCasedName,
      )
        ? possibleRegistrationNames[lowerCasedName]
        : null;
      if (registrationName != null) {
        console.error(
          'Invalid event handler property `%s`. Did you mean `%s`?',
          name,
          registrationName,
        );
        return true;
      }
    }

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
    const unknownPropString = unknownProps
      .map(prop => '`' + prop + '`')
      .join(', ');
    if (unknownProps.length === 1) {
      console.error(
        'Invalid value for prop %s on <%s> tag. Either remove it from the element, or pass a string or number value to keep it in the DOM. For details, see https://reactjs.org/link/attribute-behavior ',
        unknownPropString,
        type,
      );
    } else if (unknownProps.length > 1) {
      console.error(
        'Invalid values for props %s on <%s> tag. Either remove them from the element, or pass a string or number value to keep them in the DOM. For details, see https://reactjs.org/link/attribute-behavior ',
        unknownPropString,
        type,
      );
    }
  }
}
export function validateProperties(type, props, eventRegistry) {
  if (isCustomComponent(type, props)) {
    return;
  }
  warnUnknownProperties(type, props, eventRegistry);
}