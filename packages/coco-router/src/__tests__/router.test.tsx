import { getByText, waitFor } from '@testing-library/dom';

describe('router', () => {
    let Application;
    let application;
    let cocoMvc;
    let route;
    let page;
    let Router;
    let RouterMetadata;
    let TestWebRender;
    let getMetaClassById;

    beforeEach(async () => {
        cocoMvc = await import('coco-mvc');
        Router = cocoMvc.Router;
        RouterMetadata = cocoMvc.RouterMetadata;
        route = cocoMvc.route;
        page = cocoMvc.page;
        Application = cocoMvc.Application;
        TestWebRender = cocoMvc.TestWebRender;
        getMetaClassById = cocoMvc.getMetaClassById;
        application = new Application({
            Render: {
                qualifier: 'TestWebRender',
            },
            bootComponents: {
                Router: {},
            },
        });
    });

    afterEach(() => {
        cocoMvc.cleanCache();
        cocoMvc.unregisterMvcApi();
        jest.resetModules();
    });

    test('支持通过id获取Router类', () => {
        application.start();
        const cls = getMetaClassById('Router');
        expect(cls).toBe(RouterMetadata);
    });

    test('路由切换，页面也会重新渲染', () => {
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
