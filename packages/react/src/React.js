import { jsx, jsxs } from './ReactElement';
import { map, forEach } from './ReactChildren';
import ReactNoopUpdateQueue from './ReactNoopUpdateQueue';

/**
 * Children
 * @type {{
 *   map: (children: any, forEachFunc: any, forEachContext: any)=> void,
 *   forEach: (children: any, func: any, context: any) => void
 * }}
 */
const Children = {
  map,
  forEach,
};

export { Children, jsx, jsxs, ReactNoopUpdateQueue };
