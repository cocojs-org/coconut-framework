import { createDecoratorExp, Decorator } from 'coco-ioc-container';
import Api from '../metadata/api';

export default createDecoratorExp(
  Api
) as () => Decorator<ClassDecoratorContext>;
