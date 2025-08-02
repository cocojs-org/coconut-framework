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
import { type Application } from 'coco-ioc-container';

let application: Application;
let container: HTMLDivElement;
let renderIns: any;

/**
 *
 * @param Application
 * @param ViewComponent
 * @param RenderCls
 * @param HistoryRouterCls
 * @param scene 2种测试场景，一种是使用router(通过路由机制动态渲染组件)，一种是不使用router(直接渲染传入的组件或者是不渲染)
 * @param applicationJson
 */
function doStart(
  Application: Class<Application>,
  ViewComponent: any,
  RenderCls: Class<any>,
  HistoryRouterCls: Class<any>,
  scene: 'use-router' | 'no-router',
  applicationJson?: Record<string, any>
) {
  if (!application) {
    // 初次渲染
    application = new Application(applicationJson);
    application.start();
    renderIns = application.getComponent(RenderCls);
  }
  if (scene === 'no-router' && ViewComponent) {
    renderIns.render(ViewComponent);
  }
  return { application, container: renderIns.container };
}

function render(
  Application: Class<Application>,
  ViewComponent: any,
  Render: Class<any>,
  HistoryRouter: Class<any>,
  applicationJson: Record<string, any>
) {
  return doStart(
    Application,
    ViewComponent,
    Render,
    HistoryRouter,
    'no-router',
    applicationJson
  );
}

function start(
  Application: Class<Application>,
  Render: Class<any>,
  HistoryRouter: Class<any>,
  applicationJson: Record<string, any>
) {
  return doStart(
    Application,
    undefined,
    Render,
    HistoryRouter,
    'use-router',
    applicationJson
  );
}

function cleanRender() {
  application = undefined;
  container = undefined;
  renderIns = undefined;
}

const _test_helper_mvc = { render, start, cleanRender };

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
