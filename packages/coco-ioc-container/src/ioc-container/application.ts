import { getComponents, getViewComponent } from './component-factory';
import {
  Metadata,
  buildMetadata,
  listBeDecoratedClsByClassMetadata,
  listFieldMetadata,
  findClassMetadata,
  listFieldByMetadataCls,
  getMetaClassById,
} from '../metadata';
import {
  get,
  clear as clearDecoratorParams,
} from '../create-decorator-exp/decorator-params';
import { buildIocComponentDefinition } from './ioc-component-definition';
import Qualifier from '../decorator/metadata/qualifier';
import PropertiesConfig from './properties-config';

/**
 * 表示一个web应用实例
 * @public
 */
class Application {
  propertiesConfig: PropertiesConfig;

  constructor(jsonConfig: Record<string, any> = {}) {
    this.propertiesConfig = new PropertiesConfig(jsonConfig);
  }

  /**
   * 在项目中，所以的组件都已经收集到coco/index里面了，所以不需要进行组件收集；
   * 在测试时，组件是在执行到对应的行装饰器才会执行，所以需要先收集在启动。
   */
  public start() {
    // 收集所有的装饰器参数
    this.collectFieldOrMethodDecoratorParams();

    // 用装饰器参数初始化元数据数据
    buildMetadata(get());

    // 用元数据信息初始化ioc组件数据
    buildIocComponentDefinition();

    // TODO: 不用清空装饰器参数记录
    clearDecoratorParams();

    // 实例化配置启动项的组件
    this.bootComponent();
  }

  /**
   * 根据组件定义返回组件实例，如果存在多个子组件，需要通过qualify指定子组件id
   * @param cls - 类定义
   * @param option
   */
  public getComponent<T>(cls: Class<T>, option?: { qualifier?: string }): T;
  // 根据组件id返回组件实例
  public getComponent<T>(id: string, option?: { qualifier?: string }): T;
  public getComponent<T>(
    ClsOrId: Class<T> | string,
    option?: { qualifier?: string }
  ) {
    if (typeof ClsOrId === 'string') {
      // TODO:
      return null;
    } else {
      return getComponents(this, {
        classOrId: ClsOrId,
        qualifier: option?.qualifier,
      });
    }
  }

  /**
   * 仅用于view组件的实例化入口，其他ioc组件都应该使用getComponent
   * @param viewClass view组件的类定义
   * @param props 组件的props
   * @returns
   */
  public getViewComponent<T>(viewClass: Class<T>, props?: any[]) {
    return getViewComponent(this, viewClass, props);
  }

  /**
   * 通过元数据类名字查找元数据类本身
   * 框架会经常使用元数据类进行过滤涮选，直接import引入过于麻烦，且经常导致文件循环依赖
   */
  public getMetadataCls(name: string) {
    if (typeof name !== 'string' || !name.trim() || !getMetaClassById(name)) {
      return null;
    } else {
      return getMetaClassById(name);
    }
  }

  /**
   * 为\@autowired装饰器的字段，返回字段类型的组件实例
   * @param Cls - 类定义
   * @param deDecoratedCls - 被装饰器的类定义
   * @param autowiredField - 被装饰器的字段
   */
  public getComponentForAutowired<T>(
    Cls: Class<T>,
    deDecoratedCls: Class<T>,
    autowiredField: string
  ): T {
    const qualifierMetadata = listFieldMetadata(
      deDecoratedCls,
      autowiredField,
      Qualifier
    ) as Qualifier[];
    let qualifier;
    if (qualifierMetadata.length) {
      qualifier = qualifierMetadata[0].value;
    }
    return this.getComponent(Cls, { qualifier });
  }

  public getByClassMetadata(metadataClass: Class<any>) {
    return listBeDecoratedClsByClassMetadata(metadataClass);
  }

  public listFieldByMetadataCls = listFieldByMetadataCls;
  public findClassMetadata = findClassMetadata;

  /**
   * 实例化所有业务类（非元数据类），拿到field和method装饰器参数
   */
  private collectFieldOrMethodDecoratorParams() {
    for (const Cls of get().keys()) {
      if (Object.getPrototypeOf(Cls) !== Metadata) {
        /**
         * TODO: 如果view组件的state需要用到props初始化的话，会导致报错，例如：
         * class {
         *   constructor(props){
         *     this.name = props.name // 这里会报错
         *   }
         * }
         */
        new Cls();
      }
    }
  }

  /**
   * 启动所有配置boot的组件
   */
  private bootComponent() {
    // 1. 所有配置boot的组件集合
    const bootComponents = this.propertiesConfig.getAllBootComponents();
    if (bootComponents.length === 0) {
      return;
    }

    // TODO: 支持多个组件初始化
    const bootComponent = bootComponents[0];
    getComponents(this, { classOrId: bootComponent });
  }
}

export default Application;
