import {
  registrationNameDependencies,
  possibleRegistrationNames,
} from '../events/EventRegistry';
import setTextContent from "./setTextContent";
import isCustomComponent from '../shared/isCustomComponent';
import assertValidProps from '../shared/assertValidProps';
import { setValueForProperty, setValueForStyles } from './DOMPropertyOperations';
import {
  initWrapperState as ReactDOMInputInitWrapperState,
  getHostProps as ReactDomInputGetHostProps,
  postMountWrapper as ReactDOMInputPostMountWrapper,
  restoreControlledState as ReactDOMInputRestoreControlledState,
  updateChecked as ReactDOMInputUpdateChecked,
  updateWrapper as ReactDOMInputUpdateWrapper,
} from './ReactDomInput'
import {validateProperties as validateUnknownProperties} from '../shared/ReactDOMUnknownPropertyHook';
import { validateProperties as validateInputProperties } from '../shared/ReactDOMNullinputValuePropHook';
import { getIntrinsicNamespace, HTML_NAMESPACE } from '../shared/DOMNamespaces';
import { hasOwnProperty } from 'shared';
import { listenToNonDelegatedEvent, mediaEventTypes } from '../events/DOMPluginEventSystem';
import { track } from './inputValueTracking';

const DANGEROUSLY_SET_INNER_HTML = 'dangerouslySetInnerHTML';
const CHILDREN = 'children';
const STYLE = 'style';
const HTML = '__html';

let warnedUnknownTags;

let validatePropertiesInDevelopment;
if (__DEV__) {
  warnedUnknownTags = {
    // There are working polyfills for <dialog>. Let people use it.
    dialog: true,
    // Electron ships a custom <webview> tag to display external web content in
    // an isolated frame and process.
    // This tag is not present in non Electron environments such as JSDom which
    // is often used for testing purposes.
    // @see https://electronjs.org/docs/api/webview-tag
    webview: true,
  };
  validatePropertiesInDevelopment = function(type, props) {
    validateInputProperties(type, props);
    validateUnknownProperties(type, props, {
      registrationNameDependencies,
      possibleRegistrationNames,
    });
  };
}


function setInitialDOMProperties(
  tag,
  domElement,
  rootContainerElement,
  nextProps,
  isCustomComponentTag
) {
  for (const propKey in nextProps) {
    if (!nextProps.hasOwnProperty(propKey)) {
      continue;
    }
    const nextProp = nextProps[propKey];
    if (propKey === STYLE){
      if (__DEV__) {
        if (nextProp) {
          // Freeze the next style object so that we can assume it won't be
          // mutated. We have already warned for this in the past.
          Object.freeze(nextProp);
        }
      }
      setValueForStyles(domElement, nextProp);
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML){
      const nextHtml = nextProp ? nextProp[HTML] : undefined;
      if (nextHtml != null) {
        domElement.innerHTML = nextHtml;
      }
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === 'string') {
        setTextContent(domElement, nextProp);
      } else if (typeof nextProp === 'number') {
        setTextContent(domElement, '' + nextProp);
      }
    } else if (registrationNameDependencies.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        if (propKey === 'onScroll'){
          listenToNonDelegatedEvent('scroll', domElement);
        }
      }
    } else if (nextProp != null) {
      setValueForProperty(domElement, propKey, nextProp, isCustomComponentTag)
    }
  }
}

export function createElement(type, props, parentNamespace) {
  let isCustomComponentTag;
  let domElement;
  let namespaceURI = parentNamespace;
  if (namespaceURI === HTML_NAMESPACE) {
    namespaceURI = getIntrinsicNamespace(namespaceURI);
  }
  if (namespaceURI === HTML_NAMESPACE) {
    if (__DEV__) {
      isCustomComponentTag = isCustomComponent(type, props)
      // Should this check be gated by parent namespace? Not sure we want to
      // allow <SVG> or <mATH>.
      if (!isCustomComponentTag && type !== type.toLowerCase()) {
        console.error(
          '<%s /> is using incorrect casing. ' +
          'Use PascalCase for React components, ' +
          'or lowercase for HTML elements.',
          type,
        );
      }
    }
    domElement = document.createElement(type);
  }

  if (__DEV__) {
    if (namespaceURI === HTML_NAMESPACE) {
      if (
        !isCustomComponentTag &&
        Object.prototype.toString.call(domElement) === '[object HTMLUnknownElement]' &&
        !hasOwnProperty.call(warnedUnknownTags, type)
      ) {
        warnedUnknownTags[type] = true;
        console.error(
          'The tag <%s> is unrecognized in this browser. ' +
          'If you meant to render a React component, start its name with ' +
          'an uppercase letter.',
          type,
        );
      }
    }
  }

  return domElement;
}

export function createTextNode(text) {
  return document.createTextNode(text)
}

export function setInitialProperties(domElement, tag, rawProps) {
  const isCustomComponentTag = isCustomComponent(tag, rawProps);
  if (__DEV__) {
    validatePropertiesInDevelopment(tag, rawProps);
  }
  let props;
  switch (tag) {
    case 'dialog':
      listenToNonDelegatedEvent('cancel', domElement);
      listenToNonDelegatedEvent('close', domElement);
      props = rawProps;
      break;
    case 'iframe':
    case 'object':
    case 'embed':
      // We listen to this event in case to ensure emulated bubble
      // listeners still fire for the load event.
      listenToNonDelegatedEvent('load', domElement);
      props = rawProps;
      break;
    case 'video':
    case 'audio':
      // We listen to these events in case to ensure emulated bubble
      // listeners still fire for all the media events.
      for (let i = 0; i < mediaEventTypes.length; i++) {
        listenToNonDelegatedEvent(mediaEventTypes[i], domElement);
      }
      props = rawProps;
      break;
    case 'source':
      // We listen to this event in case to ensure emulated bubble
      // listeners still fire for the error event.
      listenToNonDelegatedEvent('error', domElement);
      props = rawProps;
      break;
    case 'details':
      // We listen to this event in case to ensure emulated bubble
      // listeners still fire for the toggle event.
      listenToNonDelegatedEvent('toggle', domElement);
      props = rawProps;
      break;
    case 'img':
    case 'image':
    case 'link':
      // We listen to these events in case to ensure emulated bubble
      // listeners still fire for error and load events.
      listenToNonDelegatedEvent('error', domElement);
      listenToNonDelegatedEvent('load', domElement);
      props = rawProps;
      break;
    case 'input':
      ReactDOMInputInitWrapperState(domElement, rawProps);
      props = ReactDomInputGetHostProps(domElement, rawProps);
      // We listen to this event in case to ensure emulated bubble
      // listeners still fire for the invalid event.
      listenToNonDelegatedEvent('invalid', domElement);
      break;
    default: {
      props = rawProps;
    }
  }

  assertValidProps(tag, props);

  setInitialDOMProperties(tag, domElement, null, props, isCustomComponentTag);

  switch (tag) {
    case 'input':
      track(domElement);
      ReactDOMInputPostMountWrapper(domElement, rawProps);
  }
}

export function diffProperties(
  domElement,
  tag,
  lastRawProps,
  nextRawProps
) {
  if (__DEV__) {
    validatePropertiesInDevelopment(tag, nextRawProps);
  }
  let updatePayload = null;
  let lastProps;
  let nextProps;
  switch (tag) {
    case 'input':
      lastProps = ReactDomInputGetHostProps(domElement, lastRawProps);
      nextProps = ReactDomInputGetHostProps(domElement, nextRawProps);
      updatePayload = [];
      break;
    default:
      lastProps = lastRawProps;
      nextProps = nextRawProps;
      break;
  }

  assertValidProps(tag, nextProps);

  let propKey;
  let styleName;
  let styleUpdates;
  for (propKey in lastProps) {
    if (
      nextProps.hasOwnProperty(propKey) ||
      !lastProps.hasOwnProperty(propKey) ||
      lastProps[propKey] == null
    ) {
      continue;
    }
    if (propKey === STYLE) {
      const lastStyle = lastProps[propKey];
      for (styleName in lastStyle) {
        if (lastStyle.hasOwnProperty(styleName)) {
          if (!styleUpdates) {
            styleUpdates = {};
          }
          styleUpdates[styleName] = '';
        }
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML || propKey === CHILDREN) {
      // Noop. This is handled by the clear text mechanism.
    } else {
      (updatePayload = updatePayload || []).push(propKey, null)
    }
  }
  for (propKey in nextProps) {
    const nextProp = nextProps[propKey];
    const lastProp = lastProps != null ? lastProps[propKey] : undefined;
    if (
      !nextProps.hasOwnProperty(propKey) ||
      nextProp === lastProp ||
      (nextProp == null && lastProp == null)
    ) {
      continue;
    }
    if (propKey === STYLE) {
      if (__DEV__) {
        if (nextProp) {
          // Freeze the next style object so that we can assume it won't be
          // mutated. We have already warned for this in the past.
          Object.freeze(nextProp);
        }
      }
      if (lastProp) {
        // Unset styles on `lastProp` but not on `nextProp`.
        for (styleName in lastProp) {
          if (
            lastProp.hasOwnProperty(styleName) &&
            (!nextProp || !nextProp.hasOwnProperty(styleName))
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = '';
          }
        }
        // Update styles that changed since `lastProp`.
        for (styleName in nextProp) {
          if (
            nextProp.hasOwnProperty(styleName) &&
            lastProp[styleName] !== nextProp[styleName]
          ) {
            if (!styleUpdates) {
              styleUpdates = {};
            }
            styleUpdates[styleName] = nextProp[styleName];
          }
        }
      } else {
        // Relies on `updateStylesByID` not mutating `styleUpdates`.
        if (!styleUpdates) {
          if (!updatePayload) {
            updatePayload = [];
          }
          updatePayload.push(propKey, styleUpdates);
        }
        styleUpdates = nextProp;
      }
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      const nextHtml = nextProp ? nextProp[HTML] : undefined;
      const lastHtml = lastProp ? lastProp[HTML] : undefined;
      if (nextHtml != null) {
        if (lastHtml !== nextHtml) {
          (updatePayload = updatePayload || []).push(propKey, nextHtml);
        }
      } else {
        // TODO: It might be too late to clear this if we have children
        // inserted already.
      }
    } else if (propKey === CHILDREN) {
      if (typeof nextProp === 'string' || typeof nextProp === 'number') {
        (updatePayload = updatePayload || []).push(propKey, '' + nextProp);
      }
    } else if (registrationNameDependencies.hasOwnProperty(propKey)) {
      if (nextProp != null) {
        if (propKey === 'onScroll') {
          listenToNonDelegatedEvent('scroll', domElement);
        }
      }
    } else {
      (updatePayload = updatePayload || []).push(propKey, nextProp)
    }
  }
  if (styleUpdates) {
    (updatePayload = updatePayload || []).push(STYLE, styleUpdates);
  }
  return updatePayload;
}

function updateDOMProperties(
  domElement,
  updatePayload,
  wasCustomComponentTag,
  isCustomComponentTag,
) {
  for (let i = 0; i < updatePayload.length; i += 2) {
    const propKey = updatePayload[i];
    const propValue = updatePayload[i + 1];
    if (propKey === STYLE) {
      setValueForStyles(domElement, propValue);
    } else if (propKey === DANGEROUSLY_SET_INNER_HTML) {
      domElement.innerHTML = propValue;
    } else if (propKey === CHILDREN) {
      setTextContent(domElement, propValue)
    } else {
      setValueForProperty(domElement, propKey, propValue, isCustomComponentTag);
    }
  }
}

export function updateProperties(
  domElement,
  updatePayload,
  tag,
  lastRawProps,
  nextRawProps
) {
  if (
    tag === 'input' &&
    nextRawProps.type === 'radio' &&
    nextRawProps.name != null
  ) {
    ReactDOMInputUpdateChecked(domElement, nextRawProps);
  }

  const wasCustomComponentTag = isCustomComponent(tag, lastRawProps);
  const isCustomComponentTag = isCustomComponent(tag, nextRawProps);
  updateDOMProperties(
    domElement,
    updatePayload,
    wasCustomComponentTag,
    isCustomComponentTag,
  )

  switch (tag) {
    case 'input':
      ReactDOMInputUpdateWrapper(domElement, nextRawProps);
      break;
  }
}

export function restoreControlledState(
  domElement,
  tag,
  props
) {
  switch (tag) {
    case 'input':
      ReactDOMInputRestoreControlledState(domElement, props);
      return;
  }
}
