/**
 * 暂时不使用React的scheduler模块，简化处理，后续有需要再加
 */
export function scheduleCallback(
  reactPriorityLevel,
  callback,
  options,
) {
  return setTimeout(() => {
    callback();
  }, 0)
}