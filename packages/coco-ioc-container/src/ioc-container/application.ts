import { getComponents, getViewComponent } from './component-factory';
import {
  Metadata,
  buildMetadata,
  getAllMetadata,
  listBeDecoratedClsByClassMetadata,
  listFieldMetadata,
  findClassMetadata,
  listFieldByMetadataCls,
  listMethodMetadata,
  getMetaClassById,
  listClassMetadata,
  listMethodByMetadataCls,
} from '../metadata';
import {
  get,
  clear as clearDecoratorParams,
} from '../create-decorator-exp/decorator-params';
import {
  addDefinition,
  addPostConstruct,
  ComponentClassPostConstructFn,
  genClassPostConstruct,
  genFieldPostConstruct,
  genMethodPostConstruct,
} from './ioc-component-definition';
import { KindClass, KindField, KindMethod } from '../create-decorator-exp';
import Component from '../decorator/metadata/component';
import { Qualifier } from '../decorator/metadata/index';
import PropertiesConfig from './properties-config';
import Scope, { SCOPE } from '../decorator/metadata/scope';
import {
  buildComponentMetadataSet,
  findComponentDecorator,
  findComponentDecoratorScope,
} from '../metadata/component-metadata';

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
    {
      this.collectFieldOrMethodDecoratorParams();
      buildMetadata(get());
      this.buildIocComponentDefinition();
    }
    // TODO: 不用清空装饰器参数记录
    clearDecoratorParams();
    {
      this.bootComponent();
    }
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
   * 找到所有类组件，添加到iocComponentDefinition中，便于后续实例化
   * 遍历所有的业务类，如果有类装饰器，那么就是类组件
   * 遍历所有配置类的方法，如果有@component装饰器，那么也是类组件
   */
  private buildIocComponentDefinition() {
    buildComponentMetadataSet();
    const bizMetadata = getAllMetadata()[1];
    // 处理@component和带有@component的元数据类
    for (const entity of get().entries()) {
      const beDecoratedCls = entity[0];
      const params = entity[1];
      if (bizMetadata.has(beDecoratedCls)) {
        const componentMetadata = findComponentDecorator(beDecoratedCls);
        if (componentMetadata) {
          // 确定存在component类装饰器，再确定scope值
          let scope: SCOPE;
          const selfScopeMetadata = listClassMetadata(
            beDecoratedCls,
            Scope
          ) as Scope[];
          if (selfScopeMetadata.length > 0) {
            scope = selfScopeMetadata[0].value;
          } else {
            scope = findComponentDecoratorScope(componentMetadata);
          }
          addDefinition(beDecoratedCls, scope === SCOPE.Singleton);
          params.forEach(
            ({
              metadataClass,
              metadataKind,
              componentPostConstruct,
              field,
            }) => {
              if (componentPostConstruct) {
                switch (metadataKind) {
                  case KindClass:
                    addPostConstruct(
                      beDecoratedCls,
                      genClassPostConstruct(
                        metadataClass,
                        componentPostConstruct as ComponentClassPostConstructFn
                      )
                    );
                    break;
                  case KindField:
                    addPostConstruct(
                      beDecoratedCls,
                      genFieldPostConstruct(
                        metadataClass,
                        componentPostConstruct,
                        field
                      )
                    );
                    break;
                  case KindMethod:
                    addPostConstruct(
                      beDecoratedCls,
                      genMethodPostConstruct(
                        metadataClass,
                        componentPostConstruct,
                        field
                      )
                    );
                    break;
                }
              }
            }
          );
        } else {
          const methods = listMethodByMetadataCls(beDecoratedCls, Component);
          for (const method of methods) {
            const componentMetas: Component[] = listMethodMetadata(
              beDecoratedCls,
              method,
              Component
            ) as Component[];
            const scopeMetas: Scope[] = listMethodMetadata(
              beDecoratedCls,
              method,
              Scope
            ) as Scope[];
            addDefinition(
              componentMetas[0].value,
              !scopeMetas.length || scopeMetas[0].value === SCOPE.Singleton,
              {
                configurationCls: beDecoratedCls,
                method,
              }
            );
          }
        }
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
