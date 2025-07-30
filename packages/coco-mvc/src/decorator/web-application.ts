import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import WebApplication from '../metadata/web-application';

export default createDecoratorExp(
  WebApplication
) as () => Decorator<ClassDecoratorContext>;
