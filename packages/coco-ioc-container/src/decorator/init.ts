import {
  createDecoratorExp,
  type Decorator,
} from '../ioc-container/create-decorator-exp';
import Init from './metadata/init';

export default createDecoratorExp(
  Init
) as () => Decorator<ClassMethodDecoratorContext>;
