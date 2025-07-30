import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Router from '../metadata/router';

export default createDecoratorExp(
  Router
) as () => Decorator<ClassDecoratorContext>;
