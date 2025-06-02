import {
  createDecoratorExp,
  type Decorator,
} from '../ioc-container/create-decorator-exp.ts';
import Value from '../metadata/value.ts';

export default createDecoratorExp(Value) as (
  path: string
) => Decorator<ClassFieldDecoratorContext>;
