export { default as Metadata } from './metadata/abstract/metadata.ts';
export { default as Autowired } from './metadata/autowired.ts';
export { default as autowired } from './decorator/autowired.ts';
export { default as Component, type Scope } from './metadata/component.ts';
export { default as component } from './decorator/component.ts';
export { default as Configuration } from './metadata/configuration.ts';
export { default as configuration } from './decorator/configuration.ts';
export { default as ConstructorParam } from './metadata/constructor-param.ts';
export { default as constructorParam } from './decorator/constructor-param.ts';
export { default as Target } from './metadata/target.ts';
export { default as target, type Type } from './decorator/target.ts';
export { default as Init } from './metadata/init.ts';
export { default as init } from './decorator/init.ts';
export { default as Qualifier } from './metadata/qualifier.ts';
export { default as qualifier } from './decorator/qualifier.ts';
export { default as Start } from './metadata/start.ts';
export { default as start } from './decorator/start.ts';
export { default as Value } from './metadata/value.ts';
export { default as value } from './decorator/value.ts';
export {
  createDecoratorExp,
  createDecoratorExpByName,
} from './ioc-container/create-decorator-exp.ts';
export {
  type PostConstructFn,
  type ClassPostConstructFn,
  type MethodPostConstructFn,
  type FieldPostConstructFn,
} from './ioc-container/ioc-component-definition.ts';
export { default as Application } from './ioc-container/application.ts';
export { default as PropertiesConfig } from './ioc-container/properties-config.ts';
export type { Decorator, Field } from './ioc-container/decorator-context.ts';

import {
  expectInOrder,
  checkClassMetadataAsExpected,
  checkMetadataForMetadataAsExpected,
  getMetadata,
  getAllMetadata,
  clear,
} from './__tests__';

let _test_helper:
  | {
      expectInOrder: typeof expectInOrder;
      checkClassMetadataAsExpected: typeof checkClassMetadataAsExpected;
      checkMetadataForMetadataAsExpected: typeof checkMetadataForMetadataAsExpected;
      getMetadata: typeof getMetadata;
      getAllMetadata: typeof getAllMetadata;
      clear: typeof clear;
    }
  | undefined = undefined;

if (__TEST__) {
  _test_helper = {
    expectInOrder,
    checkClassMetadataAsExpected,
    checkMetadataForMetadataAsExpected,
    getMetadata,
    getAllMetadata,
    clear,
  };
}

export { _test_helper };
