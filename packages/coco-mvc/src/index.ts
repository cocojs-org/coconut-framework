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
export { Render, WebRender } from 'coco-render';
export { default as Api } from './metadata/api.ts';
export { default as api } from './decorator/api.ts';
export { default as Bind } from './metadata/bind.ts';
export { default as bind } from './decorator/bind.ts';
export { default as Controller } from './metadata/controller.ts';
export { default as controller } from './decorator/controller.ts';
export { default as GlobalData } from './metadata/global-data.ts';
export { default as globalData } from './decorator/global-data.ts';
export { default as Layout } from './metadata/layout.ts';
export { default as layout } from './decorator/layout.ts';
export { default as Page } from './metadata/page.ts';
export { default as page } from './decorator/page.ts';
export { default as Ref } from './metadata/ref.ts';
export { default as ref } from './decorator/ref.ts';
export { default as Refs } from './metadata/refs.ts';
export { default as refs } from './decorator/refs.ts';
export { default as View } from './metadata/view.ts';
export { default as view } from './decorator/view.ts';
export { default as WebApplication } from './metadata/web-application.ts';
export { default as webApplication } from './decorator/web-application.ts';

import { _test_helper as _test_helper_mvc } from './__tests__';
import { _test_helper as _test_helper_iocContainer } from 'coco-ioc-container';
import { _test_helper as _test_helper_render } from 'coco-render';

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
