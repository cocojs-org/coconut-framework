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
export * from 'react';
export { Render, WebRender } from 'coco-render';
export { default as Api } from './src/decorator/metadata/api.ts';
export { default as api } from './src/decorator/api.ts';
export { default as Bind } from './src/decorator/metadata/bind.ts';
export { default as bind } from './src/decorator/bind.ts';
export { default as Controller } from './src/decorator/metadata/controller.ts';
export { default as controller } from './src/decorator/controller.ts';
export { default as GlobalData } from './src/decorator/metadata/global-data.ts';
export { default as globalData } from './src/decorator/global-data.ts';
export { default as Layout } from './src/decorator/metadata/layout.ts';
export { default as layout } from './src/decorator/layout.ts';
export { default as Page } from './src/decorator/metadata/page.ts';
export { default as page } from './src/decorator/page.ts';
export { default as Ref } from './src/decorator/metadata/ref.ts';
export { default as ref } from './src/decorator/ref.ts';
export { default as Refs } from './src/decorator/metadata/refs.ts';
export { default as refs } from './src/decorator/refs.ts';
export { default as View } from './src/decorator/metadata/view.ts';
export { default as view } from './src/decorator/view.ts';
export { default as WebApplication } from './src/decorator/metadata/web-application.ts';
export { default as webApplication } from './src/decorator/web-application.ts';
