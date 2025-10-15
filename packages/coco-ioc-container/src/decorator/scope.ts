import { createDecoratorExp, type Decorator } from '../create-decorator-exp';
import Scope, { SCOPE } from './metadata/scope';

export default createDecoratorExp(Scope) as (
    scope?: SCOPE
) => Decorator<ClassDecoratorContext | ClassMethodDecoratorContext>;
