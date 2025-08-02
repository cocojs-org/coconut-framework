export * from './index.ts';
import { register, NAME } from 'shared';
import Metadata from './metadata/abstract/metadata';

function isEqual(a: unknown, b: unknown) {
  if (
    typeof a === 'number' ||
    typeof a === 'string' ||
    typeof a === 'boolean' ||
    typeof a === 'undefined'
  ) {
    return a === b;
  } else if (Array.isArray(a)) {
    // 浅比较
    if (!Array.isArray(b) || a.length !== b.length) {
      return false;
    }
    const sortedA = [...a].sort();
    const sortedB = [...b].sort();
    for (let i = 0; i < sortedA.length; i++) {
      if (sortedA[i] !== sortedB[i]) {
        return false;
      }
    }
    return true;
  } else {
    throw new Error('未实现的比较');
  }
}

const order = [];
function item(action: 'exec' | 'apply', name: string, params: any) {
  return `[${action}][${name}][${params}]`;
}

export function reset() {
  order.length = 0;
}

export function exec(decoratorName: string, params: any) {
  order.push(item('exec', decoratorName, params));
}
register(NAME.exec, exec);

export function apply(decoratorName: string, params: any) {
  order.push(item('apply', decoratorName, params));
}
register(NAME.apply, apply);

export function get() {
  return order;
}

/**
 * 期望list的每一项都存在于order中，且每一项的前后位置和order是一样的
 */
function expectInOrder(
  list: {
    type: 'exec' | 'apply';
    name: string;
    params?: any;
  }[]
) {
  const index = list.map((i) => {
    return order.indexOf(item(i.type, i.name, i.params));
  });

  for (let i = 1; i < index.length; i++) {
    if (index[i] <= index[i - 1]) {
      return false;
    }
  }
  return true;
}

/**
 * 期望特定的类的元信息收集正确的
 * Clazz: 想要校验的类
 * expectedMetadataList: Clazz上应该具备的所有元信息
 */
function checkClassMetadataAsExpected(
  Clazz: Class<any>,
  expectedMetadataList: {
    Metadata: Class<Metadata>;
    fieldValues?: Record<string, any>;
  }[]
) {
  if (!Clazz || expectedMetadataList.length === 0) {
    return false;
  }
  const metadataList = getMetadata(Clazz);
  // 长度不等，元信息肯定不一致
  if (metadataList.length !== expectedMetadataList.length) {
    return false;
  }
  const allExpected = Array.from(expectedMetadataList, (_) => false);
  for (const { metadata } of metadataList) {
    const idx = expectedMetadataList.findIndex(
      (i) => i.Metadata === metadata.constructor
    );
    if (idx !== -1) {
      let isValueEqual = true;
      const fieldValues = expectedMetadataList[idx].fieldValues;
      if (fieldValues) {
        for (const key of Object.keys(fieldValues)) {
          if (!isEqual(metadata[key], fieldValues[key])) {
            isValueEqual = false;
            break;
          }
        }
      }
      if (isValueEqual) {
        allExpected[idx] = true;
      }
    }
  }
  return allExpected.every(Boolean);
}

// 检查元数据的元数据是否正确
function checkMetadataForMetadataAsExpected(
  expectedList: {
    metadataCls: Class<Metadata>;
    metaList: {
      Metadata: Class<Metadata>;
      fieldValues?: Record<string, any>;
    }[];
  }[]
) {
  const [metadataForMetadata] = getAllMetadata();
  if (expectedList.length !== metadataForMetadata.size) {
    return false;
  }
  for (const metadata of expectedList) {
    if (
      !checkClassMetadataAsExpected(metadata.metadataCls, metadata.metaList)
    ) {
      return false;
    }
  }
  return true;
}

import {
  getMetadata,
  getAllMetadata,
  clear as clearMetadata,
} from './ioc-container/metadata';
import { clear as clearComponentDefinition } from './ioc-container/component-factory';

import { clear as clearPreventCircularDependency } from 'shared';

function clear() {
  clearMetadata();
  clearComponentDefinition();
  clearPreventCircularDependency();
}

const _test_helper: {
  expectInOrder: typeof expectInOrder;
  checkClassMetadataAsExpected: typeof checkClassMetadataAsExpected;
  checkMetadataForMetadataAsExpected: typeof checkMetadataForMetadataAsExpected;
  getMetadata: typeof getMetadata;
  getAllMetadata: typeof getAllMetadata;
  clear: typeof clear;
} = {
  expectInOrder,
  checkClassMetadataAsExpected,
  checkMetadataForMetadataAsExpected,
  getMetadata,
  getAllMetadata,
  clear,
};

export { _test_helper };
