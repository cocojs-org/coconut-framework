import { getByText, waitFor } from '@testing-library/dom';

describe('router', () => {
  let Application;
  let application;
  let cocoMvc;
  let route;
  let page;
  let Router;
  let TestWebRender;

  beforeEach(async () => {
    cocoMvc = await import('coco-mvc');
    Router = cocoMvc.Router;
    route = cocoMvc.route;
    page = cocoMvc.page;
    Application = cocoMvc.Application;
    TestWebRender = cocoMvc.TestWebRender;
    application = new Application({
      Render: {
        qualifier: 'TestWebRender',
      },
      bootComponents: {
        Router: {},
      },
    });
  });

  afterEach(async () => {
    cocoMvc.cleanCache();
    cocoMvc.unregisterApplication();
    jest.resetModules();
  });

  test('路由切换，页面也会重新渲染', async () => {
    @route('/')
    @page()
    class IndexPage {
      render() {
        return <div>index page</div>;
      }
    }

    @route('/todo-page')
    @page()
    class TodoPage {
      render() {
        return <div>todo page</div>;
      }
    }

    application.start();
    const testWebRender = application.getComponent(TestWebRender);
    const container = testWebRender.container;
    const router = application.getComponent(Router);
    router.navigateTo('/');
    expect(getByText(container, 'index page')).toBeTruthy();
    router.navigateTo('/todo-page');
    expect(getByText(container, 'todo page')).toBeTruthy();
  });
});
