export * from './index';

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
  render: typeof _test_helper_render;
} = {
  iocContainer: _test_helper_iocContainer,
  render: _test_helper_render,
};

export { _test_helper };
