import { createDecoratorExp, Decorator } from 'coco-ioc-container';
import LocalStorage from './metadata/local-storage';

export default createDecoratorExp(LocalStorage) as () => Decorator<ClassDecoratorContext>;
