import router from '../decorator/router';
import Route from '../metadata/route';
import {
  type Application,
  constructorParam,
  init,
  start,
} from 'coco-ioc-container';
import RouteComponentMapper from './route-component-mapper';
import Router from './router';
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
    this.pathname = window.location.pathname;
    const { pageComponent, params } = this.routeComponentMapper.match(
      this.pathname
    );
    if (pageComponent) {
      this.params = params || {};
      this.render.render(pageComponent);
    } else {
      // todo 404 page
    }
  };

  @init()
  init(application: Application) {
    const routeComponentMap = application.getByClassMetadata(Route) as Map<
      Class<any>,
      Route
    >;
    this.routeComponentMapper = new RouteComponentMapper();
    this.routeComponentMapper.init(routeComponentMap);
  }

  @start()
  addListener() {
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
