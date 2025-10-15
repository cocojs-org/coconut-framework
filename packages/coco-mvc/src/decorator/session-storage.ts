import { createDecoratorExp, Decorator } from 'coco-ioc-container';
import SessionStorage from './metadata/session-storage';

export default createDecoratorExp(SessionStorage) as () => Decorator<ClassDecoratorContext>;
