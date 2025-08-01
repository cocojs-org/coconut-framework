export * from './index';

import { _test_helper as _test_helper_mvc } from './src/__tests__';
import { _test_helper as _test_helper_iocContainer } from 'coco-ioc-container';
import { _test_helper as _test_helper_render } from 'coco-render';
export {
  render,
  findDOMNode,
  unmountComponentAtNode,
  registerApplication,
  unregisterApplication,
  cleanCache,
} from 'react-dom';

/**
 * @public
 */
const _test_helper: {
  iocContainer: typeof _test_helper_iocContainer;
  mvc: typeof _test_helper_mvc;
  render: typeof _test_helper_render;
} = {
  iocContainer: _test_helper_iocContainer,
  mvc: _test_helper_mvc,
  render: _test_helper_render,
};

export { _test_helper };
