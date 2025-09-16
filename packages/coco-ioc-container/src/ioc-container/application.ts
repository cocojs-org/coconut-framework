import {
  addPostConstruct,
  findInstantiateComponent,
  getComponents,
} from './component-factory';
import {
  addClassMetadata,
  addFieldMetadata,
  addMethodMetadata,
  getAllMetadata,
  listBeDecoratedClsByClassMetadata,
  listBeDecoratedClsByFieldMetadata,
  listFieldMetadata,
  findClassMetadata,
  listFieldByMetadataCls,
  metadataClsCollection,
} from '../metadata/index';
import {
  get,
  clear as clearDecoratorParams,
  isIncludesClassDecorator,
  isIncludesMethodDecorator,
} from './decorator-params';
import {
  addDefinition,
  ComponentClassPostConstructFn,
  genClassPostConstruct,
  genFieldPostConstruct,
  genMethodPostConstruct,
} from './ioc-component-definition';
import Metadata from '../metadata/metadata';
import { KindClass, KindField, KindMethod } from './decorator-context';
import Component from '../decorator/metadata/component';
import ConstructorParam from '../decorator/metadata/constructor-param';
import { Init, Start, Qualifier } from '../decorator/metadata/index';
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
      return getComponents(this, { cls: ClsOrId, option });
    }
  }

  /**
   * 仅用于view组件的实例化入口，其他ioc组件都应该使用getComponent
   * @param ClsOrId 组件的类定义或id
   * @param props 组件的props
   * @returns
   */
  public getViewComponent<T>(ClsOrId: Class<T> | string, props?: any[]) {
    if (typeof ClsOrId === 'string') {
      // TODO:
      return null;
    } else {
      return getComponents(this, {
        cls: ClsOrId,
        option: { constructorParams: [props] },
      });
    }
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

  /**
   * todo 这里有一个疑问，为什么要把装饰器记录的参数转换成元数据？
   * 粗略一看，装饰器参数和元数据是一一对应关系，没有必要做这层转换
   * 1. 部分装饰器，例如\@component装饰在函数上面，会添加额外的装饰器信息，不过这还是可以一一对应关系
   * 2. 业务使用元数据类，方便ts推导类型
   * 3. 从装饰器 -\> 元数据，方便框架做一些自定义操作，例如target不符合则不生成对应的元数据
   */
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
        if (isIncludesClassDecorator(beDecoratedCls, Component, 2)) {
          addDefinition(beDecoratedCls);
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
            addDefinition(methodDecoratorParams.metadataParam.value, {
              configurationCls: beDecoratedCls,
              method: methodDecoratorParams.field,
            });
            /**
             * TODO: 为什么这里要添加一个component元数据呢？
             * 原因是默认情况下，组件都是有@component装饰器装饰的
             * 但是第三方的组件是通过方法注入的，没有@component装饰器
             * 但是呢在实例化的时候，需要通过元数据判断这个组件是单例还是prototype，如果找不到component元数据呢，直接报错了
             * 但是呢，虽然这个解决了问题，但是解决方案太丑陋了，1. 这行代码不合理。2. 我本来在组件上也没有component装饰器啊
             */
            addClassMetadata(
              methodDecoratorParams.metadataParam.value,
              Component,
              methodDecoratorParams.metadataParam.scope
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
    // 2. boot的组件可能会有@inject，也可能实例化子组件，那么判断一下，找到真正需要实例化的组件的集合
    const constructorParamMetadata =
      listBeDecoratedClsByClassMetadata(ConstructorParam);
    const instantiateCls: Set<Class<any>> = new Set(); // 需要实例化的组件集合
    const doFindInstantiateComponent = (clsOrId: Class<any> | string) => {
      const Cls = findInstantiateComponent(this, clsOrId);
      if (instantiateCls.has(Cls)) {
        // 已经有了
        return;
      } else {
        instantiateCls.add(Cls);
      }
      const metadata = <ConstructorParam>constructorParamMetadata.get(Cls);
      const ClsList = metadata && metadata.value;
      if (ClsList?.length) {
        ClsList.forEach((i) => {
          if (!instantiateCls.has(i)) {
            doFindInstantiateComponent(i);
          }
        });
      }
    };
    bootComponents.forEach(doFindInstantiateComponent);
    this.instantiateComponentRecursively(instantiateCls);
    this.initComponent(instantiateCls);
    this.startComponent(instantiateCls);
  }

  private instantiateComponentRecursively(bootComponent: Set<Class<any>>) {
    const map = listBeDecoratedClsByClassMetadata(ConstructorParam);
    const realInitiatedCls: Set<Class<any>> = new Set();
    for (const beDecoratedCls of map.keys()) {
      // 只初始化配置boot的组件
      if (bootComponent.has(beDecoratedCls)) {
        realInitiatedCls.add(beDecoratedCls);
      }
    }

    const doInstantiateComponent = (beDecorated: Class<any>) => {
      if (!map.has(beDecorated)) {
        return getComponents(this, { cls: beDecorated });
      } else {
        const metadata = map.get(beDecorated) as { value: Class<any>[] };
        const ParameterList = metadata.value;
        const parameterList = ParameterList.map(doInstantiateComponent);
        return getComponents(this, {
          cls: beDecorated,
          option: { constructorParams: parameterList },
        });
      }
    };

    for (const beDecorated of bootComponent) {
      doInstantiateComponent(beDecorated);
    }
  }

  private initComponent(bootComponent: Set<Class<any>>) {
    const map = listBeDecoratedClsByFieldMetadata(Init);
    for (const entity of map.entries()) {
      const beDecoratedCls = entity[0];
      const field = entity[1].field;
      if (bootComponent.has(beDecoratedCls)) {
        const component = getComponents(this, { cls: beDecoratedCls });
        component[field]?.call(component, this);
      }
    }
  }

  private startComponent(bootComponent: Set<Class<any>>) {
    const map = listBeDecoratedClsByFieldMetadata(Start);
    for (const entity of map.entries()) {
      const beDecoratedCls = entity[0];
      const field = entity[1].field;
      if (bootComponent.has(beDecoratedCls)) {
        const component = getComponents(this, { cls: beDecoratedCls });
        component[field]?.();
      }
    }
  }
}

export default Application;
