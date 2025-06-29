import isCustomComponent from './isCustomComponent';
import { BOOLEAN, getPropertyInfo, RESERVED, shouldRemoveAttributeWithWarning } from './DOMProperty';
import possibleStandardNames from './possibleStandardNames';

let validateProperty = () => {};

if (__DEV__) {
  const EVENT_NAME_REGEX = /^on./;

  validateProperty = function(tagName, name, value, eventRegistry) {

    const lowerCasedName = name.toLowerCase();
    if (lowerCasedName === 'onfocusin' || lowerCasedName === 'onfocusout') {
      console.error(
        'React uses onFocus and onBlur instead of onFocusIn and onFocusOut. ' +
        'All React events are normalized to bubble, so onFocusIn and onFocusOut ' +
        'are not needed/supported by React.',
      );
      return true;
    }

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

    if (lowerCasedName === 'innerhtml') {
      console.error(
        'Directly setting property `innerHTML` is not permitted. ' +
        'For more information, lookup documentation on `dangerouslySetInnerHTML`.',
      );
      return true;
    }

    if (lowerCasedName === 'aria') {
      console.error(
        'The `aria` attribute is reserved for future use in React. ' +
        'Pass individual `aria-` attributes instead.',
      );
      return true;
    }

    if (typeof value === 'number' && isNaN(value)) {
      console.error(
        'Received NaN for the `%s` attribute. If this is expected, cast ' +
        'the value to a string.',
        name,
      );
      return true;
    }

    const propertyInfo = getPropertyInfo(name);
    const isReserved = propertyInfo !== null && propertyInfo.type === RESERVED;

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
    } else if (!isReserved && name !== lowerCasedName) {
      // Unknown attributes should have lowercase casing since that's how they
      // will be cased anyway with server rendering.
      console.error(
        'React does not recognize the `%s` prop on a DOM element. If you ' +
        'intentionally want it to appear in the DOM as a custom ' +
        'attribute, spell it as lowercase `%s` instead. ' +
        'If you accidentally passed it from a parent component, remove ' +
        'it from the DOM element.',
        name,
        lowerCasedName,
      );
      return true;
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
      } else {
        console.error(
          'Received `%s` for a non-boolean attribute `%s`.\n\n' +
          'If you want to write it to the DOM, pass a string instead: ' +
          '%s="%s" or %s={value.toString()}.\n\n' +
          'If you used to conditionally omit it with %s={condition && value}, ' +
          'pass %s={condition ? value : undefined} instead.',
          value,
          name,
          name,
          value,
          name,
          name,
          name,
        );
      }
      return true;
    }

    if (shouldRemoveAttributeWithWarning(name, value, propertyInfo, false)) {
      return false;
    }

    if (
      (value === 'false' || value === 'true') &&
      propertyInfo !== null &&
      propertyInfo.type === BOOLEAN
    ) {
      console.error(
        'Received the string `%s` for the boolean attribute `%s`. ' +
        '%s ' +
        'Did you mean %s={%s}?',
        value,
        name,
        value === 'false'
          ? 'The browser will interpret it as a truthy value.'
          : 'Although this works, it will not work as expected if you pass the string "false".',
        name,
        value,
      );
      return true;
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