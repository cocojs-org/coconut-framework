/**
 * 用于解决循环依赖的问题
 * 元数据和装饰器不要在这里暴露，只能注册一些运行时函数
 */
const map = new Map();
export const NAME = {
  scheduleUpdateOnFiber: 'scheduleUpdateOnFiber',
  Component: 'Component',
  throwException: 'throwException',
  dispatchEventForPluginEventSystem: 'dispatchEventForPluginEventSystem',
  accumulateTwoPhaseListeners: 'accumulateTwoPhaseListeners',
  accumulateSinglePhaseListeners: 'accumulateSinglePhaseListeners',
};

export function register(name: string, fn: any) {
  if (!map.has(name)) {
    map.set(name, fn);
  } else if (__DEV__) {
    console.warn('不应该重复注册函数', name, fn);
  }
}

export function get(name: string) {
  if (NAME[name]) {
    return map.get(name);
  }
}

export function clear() {
  map.clear();
}
