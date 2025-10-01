export * from './index';

export {
  checkClassMetadataAsExpected,
  createDecoratorExpFactory,
  createMetadata,
  addClassMetadata,
  addFieldMetadata,
  getAllMetadata,
  listClassMetadata,
  listFieldMetadata,
  findClassMetadata,
  listBeDecoratedClsByClassMetadata,
  listBeDecoratedClsByFieldMetadata,
  clearMetadata,
} from 'coco-ioc-container';
export { TestWebRender } from 'coco-render';
export {
  render,
  findDOMNode,
  unmountComponentAtNode,
  registerApplication,
  unregisterApplication,
  cleanCache,
} from 'react-dom';
