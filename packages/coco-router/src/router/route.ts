/**
 * 当前路由
 */
import { store } from 'coco-view';

@store()
class Route {
    // window.location.pathname
    public pathname: string;

    // 动态路由参数
    public params: Record<string, string> = {};
}

export default Route;
