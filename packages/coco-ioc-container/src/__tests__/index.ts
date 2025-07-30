import {
  expectInOrder,
  checkClassMetadataAsExpected,
  checkMetadataForMetadataAsExpected,
} from './decorator';

import {
  getMetadata,
  getAllMetadata,
  clear as clearMetadata,
} from '../ioc-container/metadata';
import { clear as clearComponentDefinition } from '../ioc-container/component-factory';

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
