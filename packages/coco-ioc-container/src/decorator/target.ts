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

export default target;
