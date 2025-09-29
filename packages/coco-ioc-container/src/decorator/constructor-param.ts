import ConstructorParam from './metadata/constructor-param';
import { createDecoratorExp, type Decorator } from '../create-decorator-exp';

export default createDecoratorExp(
  ConstructorParam
) as () => Decorator<ClassDecoratorContext>;
