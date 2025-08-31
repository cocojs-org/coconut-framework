import {
  createDecoratorExp,
  type Decorator,
  type Application,
} from 'coco-ioc-container';
import Bind from './metadata/bind';

export default createDecoratorExp(Bind, {
  componentPostConstruct: function (
    metadata: Bind,
    application: Application,
    field?: string
  ) {
    this[field] = this[field].bind(this);
  },
}) as () => Decorator<ClassMethodDecoratorContext>;
