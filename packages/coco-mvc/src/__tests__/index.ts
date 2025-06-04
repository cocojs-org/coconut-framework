import { type Application } from 'coco-ioc-container';

let ctx: Application;
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
  if (!ctx) {
    // 初次渲染
    ctx = new Application(applicationJson);
    renderIns = ctx.getComponent(RenderCls);
  }
  if (scene === 'no-router' && ViewComponent) {
    renderIns.render(ViewComponent);
  }
  return { ctx, container: renderIns.container };
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
  ctx = undefined;
  container = undefined;
  renderIns = undefined;
}

export const _test_helper = { render, start, cleanRender };
