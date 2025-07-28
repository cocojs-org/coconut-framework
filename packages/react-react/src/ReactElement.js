import { REACT_ELEMENT_TYPE } from 'react-shared';

const RESERVED_PROPS = {
  ref: true,
};

const ReactElement = function (type, key, ref, props) {
  const element = {
    // This tag allows us to uniquely identify this as a React Element
    $$typeof: REACT_ELEMENT_TYPE,
    type: type,
    key: key,
    ref: ref,
    props: props,
  };

  return element;
};

export function cloneAndReplaceKey(oldElement, newKey) {
  const newElement = ReactElement(
    oldElement.type,
    newKey,
    oldElement.ref,
    oldElement.props
  );

  return newElement;
}

export const jsx = (component, config, maybeKey) => {
  const props = {};
  let ref = null;
  let key = null;

  if (config?.ref) {
    ref = config.ref;
  }

  if (maybeKey) {
    key = '' + maybeKey;
  }

  for (let propName in config) {
    if (
      Object.hasOwnProperty.call(config, propName) &&
      !RESERVED_PROPS.hasOwnProperty(propName)
    ) {
      props[propName] = config[propName];
    }
  } // Resolve default props

  return ReactElement(component, key, ref, props);
};
export { jsx as jsxs };

export function isValidElement(object) {
  return (
    typeof object === 'object' &&
    object !== null &&
    object.$$typeof === REACT_ELEMENT_TYPE
  );
}
