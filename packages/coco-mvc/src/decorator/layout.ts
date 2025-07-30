import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Layout from '../metadata/layout';

export default createDecoratorExp(
  Layout
) as () => Decorator<ClassDecoratorContext>;
