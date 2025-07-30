import {
  createDecoratorExp,
  type Decorator,
} from '../ioc-container/create-decorator-exp';
import Configuration from '../metadata/configuration';

export default createDecoratorExp(
  Configuration
) as () => Decorator<ClassDecoratorContext>;
