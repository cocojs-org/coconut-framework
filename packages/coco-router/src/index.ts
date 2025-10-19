export { default as RouterMeta } from './decorator/metadata/router';
export { default as RouteMeta } from './decorator/metadata/route';
export { default as route } from './decorator/route';
// TODO: 挪到test.ts中，没有必要导出
export { default as router } from './decorator/router';
export { default as Router } from './router/router';
export { default as HistoryRouter } from './router/history-router';
export { default as Route } from './router/route';
import { default as RouteComponentMapper } from './router/route-component-mapper';
export { type RouteComponentMapper };
