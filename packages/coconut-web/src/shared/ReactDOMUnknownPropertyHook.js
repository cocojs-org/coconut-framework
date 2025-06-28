import isCustomComponent from './isCustomComponent';
import { getPropertyInfo, shouldRemoveAttributeWithWarning } from './DOMProperty';
import possibleStandardNames from './possibleStandardNames';

let validateProperty = () => {};

if (__DEV__) {
  const EVENT_NAME_REGEX = /^on./;

  validateProperty = function(tagName, name, value, eventRegistry) {

    const lowerCasedName = name.toLowerCase();
    if (eventRegistry !== null) {
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
      if (EVENT_NAME_REGEX.test(name)) {
        console.error(
          'Unknown event handler property `%s`. It will be ignored.',
          name,
        );
        return true;
      }
    }

    if (lowerCasedName === 'aria') {
      console.error(
        'The `aria` attribute is reserved for future use in React. ' +
        'Pass individual `aria-` attributes instead.',
      );
      return true;
    }

    const propertyInfo = getPropertyInfo(name);

    if (possibleStandardNames.hasOwnProperty(lowerCasedName)) {
      const standardName = possibleStandardNames[lowerCasedName];
      if (standardName !== name) {
        console.error(
          'Invalid DOM property `%s`. Did you mean `%s`?',
          name,
          standardName,
        );
        return true;
      }
    }
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