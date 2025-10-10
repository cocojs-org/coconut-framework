/**
 * 因为不能直接赋值有@reactive装饰器的field，所以额外提供一个setter达到赋值的目的
 * @param reactiveField
 * @returns
 */
function reactiveAssignField(reactiveField: string) {
  return `${reactiveField}Setter`;
}

export { reactiveAssignField };
