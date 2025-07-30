export {
  Metadata,
  Autowired,
  autowired,
  Component,
  component,
  type Scope,
  Configuration,
  configuration,
  ConstructorParam,
  constructorParam,
  Target,
  target,
  type Type,
  Init,
  init,
  Qualifier,
  qualifier,
  Start,
  start,
  Value,
  value,
  createDecoratorExp,
  createDecoratorExpByName,
  type PostConstructFn,
  type ClassPostConstructFn,
  type MethodPostConstructFn,
  type FieldPostConstructFn,
  Application,
  PropertiesConfig,
  type Decorator,
  type Field,
} from 'coco-ioc-container';
export * from 'coco-reactive';
export * from 'coco-router';
export * from 'react-react';
export { Render, WebRender } from 'coco-render';
export { default as Api } from './metadata/api';
export { default as api } from './decorator/api';
export { default as Bind } from './metadata/bind';
export { default as bind } from './decorator/bind';
export { default as Controller } from './metadata/controller';
export { default as controller } from './decorator/controller';
export { default as GlobalData } from './metadata/global-data';
export { default as globalData } from './decorator/global-data';
export { default as Layout } from './metadata/layout';
export { default as layout } from './decorator/layout';
export { default as Page } from './metadata/page';
export { default as page } from './decorator/page';
export { default as Ref } from './metadata/ref';
export { default as ref } from './decorator/ref';
export { default as Refs } from './metadata/refs';
export { default as refs } from './decorator/refs';
export { default as View } from './metadata/view';
export { default as view } from './decorator/view';
export { default as WebApplication } from './metadata/web-application';
export { default as webApplication } from './decorator/web-application';

import { _test_helper as _test_helper_mvc } from './__tests__';
import { _test_helper as _test_helper_iocContainer } from 'coco-ioc-container';
import { _test_helper as _test_helper_render } from 'coco-render';
export {
  render,
  findDOMNode,
  unmountComponentAtNode,
  registerApplication,
  unregisterApplication,
  cleanCache,
} from 'react-dom';

/**
 * @public
 */
let _test_helper:
  | {
      iocContainer: typeof _test_helper_iocContainer;
      mvc: typeof _test_helper_mvc;
      render: typeof _test_helper_render;
    }
  | undefined = undefined;
if (__TEST__) {
  _test_helper = {
    iocContainer: _test_helper_iocContainer,
    mvc: _test_helper_mvc,
    render: _test_helper_render,
  };
}

export { _test_helper };
