import { createDecoratorExp, type Decorator } from '../create-decorator-exp';
import Configuration from './metadata/configuration';

export default createDecoratorExp(Configuration) as () => Decorator<ClassDecoratorContext>;
