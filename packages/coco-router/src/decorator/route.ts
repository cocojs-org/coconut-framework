import {
  createDecoratorExp,
  type ApplicationContext,
  type Decorator,
} from 'coco-ioc-container';
import Route from '../metadata/route.ts';

export default createDecoratorExp(Route) as (
  url: string
) => Decorator<ClassDecoratorContext>;
