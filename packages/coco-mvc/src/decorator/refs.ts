import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Refs from '../metadata/refs.ts';

export default createDecoratorExp(
  Refs
) as () => Decorator<ClassFieldDecoratorContext>;
