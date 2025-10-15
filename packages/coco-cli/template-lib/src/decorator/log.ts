import { createDecoratorExp, type Decorator } from 'coco-mvc';
import Log from './metadata/log';

export default createDecoratorExp(Log) as () => Decorator<ClassMethodDecoratorContext>;
