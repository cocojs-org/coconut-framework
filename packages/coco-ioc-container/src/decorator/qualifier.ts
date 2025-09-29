import { createDecoratorExp, type Decorator } from '../create-decorator-exp';
import Qualifier from './metadata/qualifier';

export default createDecoratorExp(Qualifier) as (
  clsId: string
) => Decorator<ClassFieldDecoratorContext>;
