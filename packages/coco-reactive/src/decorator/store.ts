import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Store from '../metadata/store.ts';

export default createDecoratorExp(
  Store
) as () => Decorator<ClassDecoratorContext>;
