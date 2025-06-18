export function scheduleCallback(
  reactPriorityLevel,
  callback,
  options,
) {
  /**
   * 暂时不使用React的scheduler模块，简化处理，后续有需要再加
   */
  return setTimeout(() => {
    callback();
  }, 0)
}