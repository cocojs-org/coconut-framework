import { createDecoratorExp, Decorator } from 'coco-ioc-container';
import Util from './metadata/util';

export default createDecoratorExp(Util) as () => Decorator<ClassDecoratorContext>;
