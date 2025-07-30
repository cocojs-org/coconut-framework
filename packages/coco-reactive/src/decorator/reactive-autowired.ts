import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import ReactiveAutowired from '../metadata/reactive-autowired';

export default createDecoratorExp(
  ReactiveAutowired
) as () => Decorator<ClassFieldDecoratorContext>;
