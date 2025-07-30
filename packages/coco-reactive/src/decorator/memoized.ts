import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Memoized from '../metadata/memoized';

export default createDecoratorExp(
  Memoized
) as () => Decorator<ClassMethodDecoratorContext>;
