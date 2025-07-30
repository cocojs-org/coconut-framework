import {
  createDecoratorExp,
  type Application,
  type Decorator,
} from 'coco-ioc-container';
import Reactive from '../metadata/reactive';

export default createDecoratorExp(Reactive) as () => Decorator<
  ClassFieldDecoratorContext | ClassDecoratorContext
>;
