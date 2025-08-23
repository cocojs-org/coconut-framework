import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import ReactiveAutowired from '../metadata/reactive-autowired';

// TODO: 后期考虑直接使用autowired注入store
export default createDecoratorExp(
  ReactiveAutowired
) as () => Decorator<ClassFieldDecoratorContext>;
