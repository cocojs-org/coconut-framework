import type { Render } from 'coco-render';
import type RouteComponentMapper from './route-component-mapper';
import router from '../decorator/router';
import type Route from './route.ts';

/**
 * @public
 */
@router()
abstract class Router {
  protected route: Route;

  protected render: Render;

  protected routeComponentMapper: RouteComponentMapper;

  public abstract navigateTo(url: string): void;
}

export default Router;
