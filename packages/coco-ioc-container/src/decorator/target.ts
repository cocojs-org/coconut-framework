import {
    createPlaceholderDecoratorExp,
    KindClass,
    KindField,
    KindMethod,
    DecoratorExpWithDecoratorSelf,
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
const target: DecoratorExpWithDecoratorSelf<Type[]> = createPlaceholderDecoratorExp();

// TODO: @target有可能先装饰其他非Target吗？可以的话需要抛出异常
export default target;
