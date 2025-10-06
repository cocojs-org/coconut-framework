export { default as Metadata } from './metadata/create-metadata';
export { default as Autowired } from './decorator/metadata/autowired';
export { default as autowired } from './decorator/autowired';
export { default as Component } from './decorator/metadata/component';
export { default as component } from './decorator/component';
export { default as Configuration } from './decorator/metadata/configuration';
export { default as configuration } from './decorator/configuration';
export { default as ConstructorParam } from './decorator/metadata/constructor-param';
export { default as constructorParam } from './decorator/constructor-param';
export { default as Target } from './decorator/metadata/target';
export { default as target, type Type } from './decorator/target';
export { default as Scope, SCOPE } from './decorator/metadata/scope';
export { default as scope } from './decorator/scope';
export { default as Qualifier } from './decorator/metadata/qualifier';
export { default as qualifier } from './decorator/qualifier';
export { default as Value } from './decorator/metadata/value';
export { default as value } from './decorator/value';
export {
  createDecoratorExp,
  createPlaceholderDecoratorExp,
  KindClass,
  KindField,
  KindMethod,
  type Decorator,
  type Field,
} from './create-decorator-exp';
export { default as Application } from './application';
export { default as PropertiesConfig } from './properties/properties-config';
export { defineMetadataId } from './metadata';
