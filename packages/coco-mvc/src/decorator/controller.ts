import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Controller from './metadata/controller';

export default createDecoratorExp(
  Controller
) as () => Decorator<ClassDecoratorContext>;
