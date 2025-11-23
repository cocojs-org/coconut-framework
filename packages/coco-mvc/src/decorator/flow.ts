import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import Flow from './metadata/flow';

export default createDecoratorExp(Flow) as () => Decorator<ClassDecoratorContext>;
