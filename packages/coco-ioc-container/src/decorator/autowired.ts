import { createDecoratorExp, type Decorator } from '../create-decorator-exp';
import Autowired from './metadata/autowired';

// TODO: cls?: Class<any>如果去掉的话，在项目中会报错，应该是ts-server是拿到参数了，但是声明中确没有
export default createDecoratorExp(Autowired) as (cls?: Class<any>) => Decorator<ClassFieldDecoratorContext>;
