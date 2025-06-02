import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Memoized from '../metadata/memoized.ts';

export default createDecoratorExp(
  Memoized
) as () => Decorator<ClassMethodDecoratorContext>;
