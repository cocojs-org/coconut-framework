import router from '../decorator/router';
import RouteMeta from '../decorator/metadata/route';
import { type Application, constructorParam } from 'coco-ioc-container';
import RouteComponentMapper from './route-component-mapper';
import Router from './router';
import Route from './route';
import { Render } from 'coco-render';

/**
 * @public
 */
@router()
@constructorParam()
class HistoryRouter extends Router {
    constructor(render: Render) {
        super();
        this.render = render;
    }

    handleRouteChange = () => {
        const pathname = window.location.pathname;
        const { pageComponent, params } = this.routeComponentMapper.match(pathname);
        this.route.pathname = pathname;
        this.route.params = params || {};
        if (pageComponent) {
            this.render.render(pageComponent);
        } else {
            // todo 404 page
        }
    };

    init(application: Application) {
        const routeComponentMap = application.listBeDecoratedClsByClassKindMetadata(RouteMeta) as Map<
            Class<any>,
            RouteMeta
        >;
        this.routeComponentMapper = new RouteComponentMapper();
        this.routeComponentMapper.init(routeComponentMap);
        this.route = application.getComponent(Route);
    }

    start() {
        window.addEventListener('popstate', this.handleRouteChange);
        // 初始化渲染
        this.handleRouteChange();
    }

    removeListener() {
        window.removeEventListener('popstate', this.handleRouteChange);
    }

    public navigateTo(url: string) {
        window.history.pushState({}, '', url);
        this.handleRouteChange();
    }
}

export default HistoryRouter;
