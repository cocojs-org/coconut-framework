import { getByText, waitFor } from '@testing-library/dom';

describe('router', () => {
    let Application;
    let application;
    let cocoMvc;
    let component;
    let route;
    let page;
    let Router;
    let router;
    let RouterMeta;
    let TestWebRender;
    let consoleErrorSpy;
    beforeEach(async () => {
        cocoMvc = await import('@cocojs/mvc');
        component = cocoMvc.component;
        Router = cocoMvc.Router;
        router = cocoMvc.router;
        RouterMeta = cocoMvc.RouterMeta;
        route = cocoMvc.route;
        page = cocoMvc.page;
        Application = cocoMvc.Application;
        TestWebRender = cocoMvc.TestWebRender;
        consoleErrorSpy = jest.spyOn(console, 'error');
        consoleErrorSpy.mockImplementation(() => {});
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
        application.destructor();
        jest.resetModules();
        consoleErrorSpy.mockRestore();
    });

    test('支持通过id获取Router类', () => {
        application.start();
        const cls = application.getMetaClassById('Router');
        expect(cls).toBe(RouterMeta);
    });

    test('@router装饰器不能装饰在字段上', () => {
        @component()
        class Button {
            @router('field')
            field: string;
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10005：%s 类 %s 字段上field装饰器 %s 只能用于装饰%s',
            'Button',
            'field',
            '@router',
            'class'
        );
    });

    test('@router装饰器不能装饰在method上', () => {
        @component()
        class Button {
            @router('field')
            getName() {}
        }

        application.start();
        expect(consoleErrorSpy).toHaveBeenCalledWith(
            'CO10006：%s 类 %s 方法上method装饰器 %s 只能用于装饰%s',
            'Button',
            'getName',
            '@router',
            'class'
        );
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
