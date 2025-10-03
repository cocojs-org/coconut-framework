import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Effect from './metadata/effect';

export default createDecoratorExp(
  Effect
) as () => Decorator<ClassDecoratorContext>;
