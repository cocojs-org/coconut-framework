export { default as Metadata } from './metadata/abstract/metadata';
export { default as Autowired } from './metadata/autowired';
export { default as autowired } from './decorator/autowired';
export { default as Component, type Scope } from './metadata/component';
export { default as component } from './decorator/component';
export { default as Configuration } from './metadata/configuration';
export { default as configuration } from './decorator/configuration';
export { default as ConstructorParam } from './metadata/constructor-param';
export { default as constructorParam } from './decorator/constructor-param';
export { default as Target } from './metadata/target';
export { default as target, type Type } from './decorator/target';
export { default as Init } from './metadata/init';
export { default as init } from './decorator/init';
export { default as Qualifier } from './metadata/qualifier';
export { default as qualifier } from './decorator/qualifier';
export { default as Start } from './metadata/start';
export { default as start } from './decorator/start';
export { default as Value } from './metadata/value';
export { default as value } from './decorator/value';
export {
  createDecoratorExp,
  createDecoratorExpByName,
} from './ioc-container/create-decorator-exp';
export {
  type PostConstructFn,
  type ClassPostConstructFn,
  type MethodPostConstructFn,
  type FieldPostConstructFn,
} from './ioc-container/ioc-component-definition';
export { default as Application } from './ioc-container/application';
export { default as PropertiesConfig } from './ioc-container/properties-config';
export type { Decorator, Field } from './ioc-container/decorator-context';

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
