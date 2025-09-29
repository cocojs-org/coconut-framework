import {
  createDecoratorExpByName,
  Decorator,
  KindClass,
  KindField,
  KindMethod,
} from '../create-decorator-exp';

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
