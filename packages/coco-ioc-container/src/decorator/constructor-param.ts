import ConstructorParam from '../metadata/constructor-param';
import {
  createDecoratorExp,
  type Decorator,
} from '../ioc-container/create-decorator-exp';

export default createDecoratorExp(
  ConstructorParam
) as () => Decorator<ClassDecoratorContext>;
