import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Bind from '../metadata/bind.ts';

export default createDecoratorExp(
  Bind
) as () => Decorator<ClassMethodDecoratorContext>;
