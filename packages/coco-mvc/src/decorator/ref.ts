import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Ref from '../metadata/ref.ts';

export default createDecoratorExp(
  Ref
) as () => Decorator<ClassFieldDecoratorContext>;
