import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Refs from '../metadata/refs';

export default createDecoratorExp(
  Refs
) as () => Decorator<ClassFieldDecoratorContext>;
