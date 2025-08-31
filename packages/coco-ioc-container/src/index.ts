export { default as Metadata } from './decorator/metadata/abstract/metadata';
export { default as Autowired } from './decorator/metadata/autowired';
export { default as autowired } from './decorator/autowired';
export {
  default as Component,
  type Scope,
} from './decorator/metadata/component';
export { default as component } from './decorator/component';
export { default as Configuration } from './decorator/metadata/configuration';
export { default as configuration } from './decorator/configuration';
export { default as ConstructorParam } from './decorator/metadata/constructor-param';
export { default as constructorParam } from './decorator/constructor-param';
export { default as Target } from './decorator/metadata/target';
export { default as target, type Type } from './decorator/target';
export { default as Init } from './decorator/metadata/init';
export { default as init } from './decorator/init';
export { default as Qualifier } from './decorator/metadata/qualifier';
export { default as qualifier } from './decorator/qualifier';
export { default as Start } from './decorator/metadata/start';
export { default as start } from './decorator/start';
export { default as Value } from './decorator/metadata/value';
export { default as value } from './decorator/value';
export {
  createDecoratorExp,
  createDecoratorExpByName,
} from './ioc-container/create-decorator-exp';
export {
  type ComponentPostConstructFn,
  type ComponentClassPostConstructFn,
  type ComponentMethodPostConstructFn,
  type ComponentFieldPostConstructFn,
} from './ioc-container/ioc-component-definition';
export { default as Application } from './ioc-container/application';
export { default as PropertiesConfig } from './ioc-container/properties-config';
export type { Decorator, Field } from './ioc-container/decorator-context';
