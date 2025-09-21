import { getComponents, getViewComponent } from './component-factory';
import {
  addClassMetadata,
  addFieldMetadata,
  addMethodMetadata,
  getAllMetadata,
  listBeDecoratedClsByClassMetadata,
  listFieldMetadata,
  findClassMetadata,
  listFieldByMetadataCls,
  metadataClsCollection,
  listMethodMetadata,
} from '../metadata/index';
import {
  get,
  clear as clearDecoratorParams,
  isIncludesClassDecorator,
  isIncludesMethodDecorator,
} from './decorator-params';
import {
  addDefinition,
  addPostConstruct,
  ComponentClassPostConstructFn,
  genClassPostConstruct,
  genFieldPostConstruct,
  genMethodPostConstruct,
} from './ioc-component-definition';
import Metadata from '../metadata/metadata';
import { KindClass, KindField, KindMethod } from './decorator-context';
import Component from '../decorator/metadata/component';
import { Qualifier } from '../decorator/metadata/index';
import PropertiesConfig from './properties-config';
import { Diagnose, printDiagnose } from 'shared';
import validate from '../metadata/validate';

/**
 * 表示一个web应用实例
 * @public
 */
class Application {
  propertiesConfig: PropertiesConfig;

  diagnoseList: Diagnose[];

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
      this.buildMetadata();
      // TODO: 校验全部放在core里面做到，然后业务上获取的时候先过滤掉非法的元数据，只从合法的元数据中查找
      this.diagnoseList = validate(getAllMetadata());
      if (this.diagnoseList.length > 0) {
        this.diagnoseList.forEach(printDiagnose);
      }
      this.buildIocComponentDefinition();
    }
    // todo 不用清空装饰器参数记录
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
    if (
      typeof name !== 'string' ||
      !name.trim() ||
      !metadataClsCollection.has(name)
    ) {
      return null;
    } else {
      return metadataClsCollection.get(name);
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

  // 根据装饰器的参数，构建对应的元数据实例
  private buildMetadata() {
    for (const entity of get().entries()) {
      const beDecoratedCls = entity[0];
      const list = entity[1];
      for (const p of list) {
        const metadataKind = p.metadataKind;
        const metadataClass = p.metadataClass;
        const metadataParam = p.metadataParam;
        const field = p.field;
        switch (metadataKind) {
          case KindClass:
            addClassMetadata(beDecoratedCls, metadataClass, metadataParam);
            break;
          case KindField:
            addFieldMetadata(
              beDecoratedCls,
              field,
              metadataClass,
              metadataParam
            );
            break;
          case KindMethod:
            addMethodMetadata(
              beDecoratedCls,
              field,
              metadataClass,
              metadataParam
            );
            break;
        }
      }
    }
  }

  // 如果有类装饰器，则添加到ioc组件定义中
  private buildIocComponentDefinition() {
    const bizMetadata = getAllMetadata()[1];
    // 处理@component和带有@component的元数据类
    for (const entity of get().entries()) {
      const beDecoratedCls = entity[0];
      const params = entity[1];
      if (bizMetadata.has(beDecoratedCls)) {
        // TODO: 这里不应该从装饰器中找component，因为可能是非法的，应该从元数据中找
        if (isIncludesClassDecorator(beDecoratedCls, Component, 2)) {
          const meta = findClassMetadata(beDecoratedCls, Component, 2);
          addDefinition(
            beDecoratedCls,
            meta.scope === Component.Scope.Singleton
          );
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
          const methodDecoratorParams = isIncludesMethodDecorator(
            beDecoratedCls,
            Component
          );
          if (methodDecoratorParams) {
            const metadata: Component[] = listMethodMetadata(
              beDecoratedCls,
              methodDecoratorParams.field,
              Component
            ) as Component[];
            addDefinition(
              methodDecoratorParams.metadataParam.value,
              metadata[0].scope === Component.Scope.Singleton,
              {
                configurationCls: beDecoratedCls,
                method: methodDecoratorParams.field,
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
