import {
  expectInOrder,
  checkClassMetadataAsExpected,
  checkMetadataForMetadataAsExpected,
} from './decorator.ts';

import {
  getMetadata,
  getAllMetadata,
  clear as clearMetadata,
} from '../ioc-container/metadata.ts';
import { clear as clearComponentDefinition } from '../ioc-container/component-factory.ts';

import { clear as clearPreventCircularDependency } from 'shared';

function clear() {
  clearMetadata();
  clearComponentDefinition();
  clearPreventCircularDependency();
}

export {
  expectInOrder,
  checkClassMetadataAsExpected,
  checkMetadataForMetadataAsExpected,
  getMetadata,
  getAllMetadata,
  clear,
};
