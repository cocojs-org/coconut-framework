import {
  createDecoratorExp,
  type Decorator,
} from '../ioc-container/create-decorator-exp';
import Value from '../metadata/value';

export default createDecoratorExp(Value) as (
  path: string
) => Decorator<ClassFieldDecoratorContext>;
