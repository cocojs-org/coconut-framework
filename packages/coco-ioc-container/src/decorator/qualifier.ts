import {
  createDecoratorExp,
  type Decorator,
} from '../ioc-container/create-decorator-exp';
import Qualifier from './metadata/qualifier';

export default createDecoratorExp(Qualifier) as (
  clsId: string
) => Decorator<ClassFieldDecoratorContext>;
