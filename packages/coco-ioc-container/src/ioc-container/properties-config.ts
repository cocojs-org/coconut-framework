/**
 * 动态配置操作类
 * @public
 */
class PropertiesConfig {
  static bootComponentKey = 'bootComponents';

  beanConfig: Record<string, any>;

  constructor(jsonConfig: Record<string, any> = {}) {
    this.beanConfig = jsonConfig;
  }

  public getValue(path: string): any {
    let value = this.beanConfig;
    for (const prop of path.trim().split('.')) {
      if (!value) {
        if (__DEV__) {
          console.warn(`没有取到${path}对应的配置值！`);
        }
        break;
      }
      value = value[prop];
    }
    return value;
  }

  public getAllBootComponents() {
    const boots: string[] = [];
    const bootComponents = this.beanConfig[PropertiesConfig.bootComponentKey];
    if (
      bootComponents &&
      typeof bootComponents === 'object' &&
      bootComponents.toString() === '[object Object]'
    ) {
      for (const [componentId, value] of Object.entries(bootComponents)) {
        if (!!value) {
          boots.push(componentId);
        }
      }
    }
    return boots;
  }
}

export default PropertiesConfig;
