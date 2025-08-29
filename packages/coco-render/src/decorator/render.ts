import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Render from './metadata/render';

export default createDecoratorExp(
  Render
) as () => Decorator<ClassDecoratorContext>;
