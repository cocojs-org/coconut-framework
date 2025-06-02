import {
  createDecoratorExp,
  type ApplicationContext,
  type Decorator,
} from 'coco-ioc-container';
import Reactive from '../metadata/reactive.ts';

export default createDecoratorExp(Reactive) as () => Decorator<
  ClassFieldDecoratorContext | ClassDecoratorContext
>;
