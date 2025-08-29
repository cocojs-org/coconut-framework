import {
  createDecoratorExp,
  type Application,
  type Decorator,
} from 'coco-ioc-container';
import Route from './metadata/route';

export default createDecoratorExp(Route) as (
  url: string
) => Decorator<ClassDecoratorContext>;
