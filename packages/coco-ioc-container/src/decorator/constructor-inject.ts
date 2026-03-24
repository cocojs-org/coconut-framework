import ConstructorInject from './metadata/constructor-inject.ts';
import { createDecoratorExp, type Decorator } from '../create-decorator-exp';

export default createDecoratorExp(ConstructorInject) as () => Decorator<ClassDecoratorContext>;
