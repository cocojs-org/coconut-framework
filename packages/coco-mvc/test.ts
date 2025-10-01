export * from './index';

export {
  checkClassMetadataAsExpected,
  createDecoratorExpFactory,
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
