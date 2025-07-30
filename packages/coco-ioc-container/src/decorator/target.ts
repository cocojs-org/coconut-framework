import {
  Context,
  Decorator,
  KindClass,
  KindField,
  KindMethod,
} from '../ioc-container/decorator-context';
import { createDecoratorExpByName } from '../ioc-container/create-decorator-exp';

/**
 * @public
 */
export enum Type {
  Class = KindClass,
  Field = KindField,
  Method = KindMethod,
}

/**
 * @public
 */
const target: (
  type: Type[],
  decoratorSelf?: true
) => Decorator<ClassDecoratorContext> = createDecoratorExpByName('target');
export default target;
