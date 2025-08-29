import RouteClass from '../decorator/metadata/route';
import DynamicRoute from './dynamic-route';

type Route = string | DynamicRoute;

/**
 * @public
 */
class RouteComponentMapper {
  mapper: Map<Route, Class<any>> = new Map();

  init(map: Map<Class<any>, RouteClass>) {
    for (const [pageComponent, route] of map.entries()) {
      if (route.value.includes(':')) {
        this.add(new DynamicRoute(route.value), pageComponent);
      } else {
        this.add(route.value, pageComponent);
      }
    }
  }

  private add(routeUrl: Route, PageComponent: Class<any>) {
    if (this.mapper.has(routeUrl)) {
      console.error('重复的URL', routeUrl);
    } else {
      this.mapper.set(routeUrl, PageComponent);
    }
  }

  match(url: string): any {
    for (const [route, pageComponent] of this.mapper.entries()) {
      if (typeof route === 'string') {
        if (route === url) {
          return { pageComponent };
        }
      } else {
        const params = route.match(url);
        if (params) {
          return { pageComponent, params };
        }
      }
    }
    return {};
  }
}

export default RouteComponentMapper;
