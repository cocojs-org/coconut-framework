import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import ReactiveAutowired from '../metadata/reactive-autowired.ts';

export default createDecoratorExp(
  ReactiveAutowired
) as () => Decorator<ClassFieldDecoratorContext>;
