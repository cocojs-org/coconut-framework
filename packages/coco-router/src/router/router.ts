import type { Render } from 'coco-render';
import type RouteComponentMapper from './route-component-mapper';
import router from '../decorator/router';

/**
 * @public
 */
@router()
abstract class Router {
  public pathname: string;
  public params: Record<string, string>; // 动态路由参数
  public render: Render;

  protected constructor() {
    this.params = {};
  }

  protected routeComponentMapper: RouteComponentMapper;

  public abstract navigateTo(url: string): void;
}

export default Router;
