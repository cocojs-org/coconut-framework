export const RESERVED = 0;
export const STRING = 1;

const properties = {};

[
  ['className', 'class'],
].forEach(([name, attributeName]) => {
  properties[name] = new PropertyInfoRecord(
    name,
    STRING,
    false,
    attributeName,
    null,
    false,
    false,
  );
});

export function getPropertyInfo(name) {
  return properties.hasOwnProperty(name) ? properties[name] : null;
}

function PropertyInfoRecord(
  name,
  type,
  mustUseProperty,
  attributeName,
  attributeNamespace,
  sanitizeURL,
  removeEmptyString,
) {
  this.attributeName = attributeName;
  this.attributeNamespace = attributeNamespace;
  this.mustUseProperty = mustUseProperty;
  this.propertyName = name;
  this.type = type;
  this.sanitizeURL = sanitizeURL;
  this.removeEmptyString = removeEmptyString;
}

export function shouldIgnoreAttribute(
  name,
  propertyInfo
  ) {
  if (propertyInfo !== null) {
    return propertyInfo.type === RESERVED;
  }
  if (
    name.length > 2 &&
    (name[0] === 'o' || name[0] === 'O') &&
    (name[1] === 'n' || name[1] === 'N')
  ) {
    return true;
  }
  return false;
}

export function shouldRemoveAttribute(
  name,
  value,
  propertyInfo,
) {
  if (value === null || typeof value === 'undefined') {
    return true
  }
  return false;
}