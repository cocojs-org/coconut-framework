import {
  addDefinition,
  addPostConstruct,
  findInstantiateComponent,
  getComponent,
} from './component-factory.ts';
import {
  addClassMetadata,
  addFieldOrMethodMetadata,
  getAllMetadata,
  listBeDecoratedClsByClassMetadata,
  listBeDecoratedClsByFieldMetadata,
  listFieldMetadata,
  listFieldByMetadataCls,
  metadataClsCollection,
} from './metadata.ts';
import {
  get,
  clear as clearDecoratorParams,
  isIncludesClassDecorator,
  addDecoratorParams,
} from './decorator-params.ts';
import {
  ClassPostConstructFn,
  genClassPostConstruct,
  genFieldPostConstruct,
  genMethodPostConstruct,
} from './ioc-component-definition.ts';
import Metadata from '../metadata/abstract/metadata.ts';
import { KindClass, KindField, KindMethod } from './decorator-context.ts';
import Component from '../metadata/component.ts';
import type { Scope } from '../metadata/component.ts';
import {
  isChildClass,
  isPlainObject,
  lowercaseFirstLetter,
} from '../share/util.ts';
import Configuration from '../metadata/configuration.ts';
import ConstructorParam from '../metadata/constructor-param.ts';
import { Init, Start, Target, Qualifier } from '../metadata/index.ts';
import PropertiesConfig from './properties-config.ts';

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
      this.addFieldOrMethodDecoratorParams();
      this.addAtComponentDecoratorParams();
      this.validateTarget();
      this.buildMetadata();
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
  public getComponent<T>(
    cls: Class<T>,
    option?: { constructorParams?: any[]; qualifier?: string }
  ): T;
  // 根据组件id返回组件实例
  public getComponent<T>(id: string, option?: { constructorParams?: any[] }): T;
  public getComponent<T>(
    ClsOrId: Class<T> | string,
    option: { constructorParams?: any[]; qualifier?: string } = {}
  ): T {
    const { constructorParams, qualifier } = option;
    return getComponent(this, ClsOrId, {
      qualifier,
      newParameters: constructorParams,
    });
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

  /**
   * 实例化所有业务类（非元数据类），拿到field和method装饰器参数
   */
  private addFieldOrMethodDecoratorParams() {
    for (const Cls of get().keys()) {
      if (Object.getPrototypeOf(Cls) !== Metadata) {
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
          case KindMethod:
            addFieldOrMethodMetadata(
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
            ({ metadataClass, metadataKind, postConstruct, field }) => {
              if (postConstruct) {
                switch (metadataKind) {
                  case KindClass:
                    addPostConstruct(
                      beDecoratedCls,
                      genClassPostConstruct(
                        metadataClass,
                        postConstruct as ClassPostConstructFn
                      )
                    );
                    break;
                  case KindField:
                    addPostConstruct(
                      beDecoratedCls,
                      genFieldPostConstruct(metadataClass, postConstruct, field)
                    );
                    break;
                  case KindMethod:
                    addPostConstruct(
                      beDecoratedCls,
                      genMethodPostConstruct(
                        metadataClass,
                        postConstruct,
                        field
                      )
                    );
                    break;
                }
              }
            }
          );
        }
      }
    }
  }

  // 为@component添加装饰器参数
  private addAtComponentDecoratorParams() {
    for (const entity of get().entries()) {
      const beDecoratedCls = entity[0];
      const params = entity[1];
      if (!isIncludesClassDecorator(beDecoratedCls, Configuration, 1)) {
        continue;
      }
      const componentDecorateParams = params.filter(
        (i) => i.metadataKind === KindMethod && i.metadataClass === Component
      );
      componentDecorateParams.forEach(function (param) {
        let targetCls: Class<any>;
        let scope: Scope;
        if (isPlainObject(param.metadataParam)) {
          targetCls = param.metadataParam.value;
          scope = param.metadataParam.scope;
        } else {
          targetCls = param.metadataParam;
        }
        addDecoratorParams(targetCls, {
          decoratorName: lowercaseFirstLetter(Component.name),
          metadataKind: KindClass,
          metadataClass: Component,
          metadataParam: scope,
        });
      });
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
        return getComponent(this, beDecorated);
      } else {
        const metadata = map.get(beDecorated) as { value: Class<any>[] };
        const ParameterList = metadata.value;
        const parameterList = ParameterList.map(doInstantiateComponent);
        return getComponent(this, beDecorated, {
          newParameters: parameterList,
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
        const component = getComponent(this, beDecoratedCls);
        component[field]?.(this);
      }
    }
  }

  private startComponent(bootComponent: Set<Class<any>>) {
    const map = listBeDecoratedClsByFieldMetadata(Start);
    for (const entity of map.entries()) {
      const beDecoratedCls = entity[0];
      const field = entity[1].field;
      if (bootComponent.has(beDecoratedCls)) {
        const component = getComponent(this, beDecoratedCls);
        component[field]?.();
      }
    }
  }

  private validateTarget() {
    const allDecoratorParams = get();
    for (const entity of allDecoratorParams.entries()) {
      const beDecoratedCls = entity[0];
      const params = entity[1];
      for (const p of params) {
        const metadataClass = p.metadataClass;
        const metadataKind = p.metadataKind;
        const decoratorName = p.decoratorName;
        const decoratorDecoratorParams =
          allDecoratorParams.get(metadataClass) || [];
        const find = decoratorDecoratorParams.find(
          (i) => i.metadataClass === Target
        );
        if (!find) {
          if (__DEV__) {
            console.warn(
              `${metadataClass}应该添加@target装饰器，以明确装饰器对象。`
            );
          }
          return;
        }
        if (find.metadataParam.indexOf(metadataKind) === -1) {
          if (__DEV__) {
            console.error(
              beDecoratedCls,
              '没有按照target限制使用装饰器:',
              metadataClass,
              '。'
            );
          } else {
            throw new Error(
              `[${beDecoratedCls.name}]使用@${decoratorName}和其定义的@target值不一致。`
            );
          }
        }
      }
    }
  }
}

export default Application;
