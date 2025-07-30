import Start from '../metadata/start';
import {
  createDecoratorExp,
  type Decorator,
} from '../ioc-container/create-decorator-exp';

export default createDecoratorExp(
  Start
) as () => Decorator<ClassMethodDecoratorContext>;
