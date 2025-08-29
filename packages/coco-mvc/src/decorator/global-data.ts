import { createDecoratorExp, type Decorator } from 'coco-ioc-container';
import GlobalData from './metadata/global-data';

export default createDecoratorExp(
  GlobalData
) as () => Decorator<ClassDecoratorContext>;
