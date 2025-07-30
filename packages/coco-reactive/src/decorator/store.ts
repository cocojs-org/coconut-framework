import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Store from '../metadata/store';

export default createDecoratorExp(
  Store
) as () => Decorator<ClassDecoratorContext>;
