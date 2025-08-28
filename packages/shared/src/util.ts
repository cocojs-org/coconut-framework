/**
 * 带有@reactive装饰器的field不能直接赋值，因为触发rerender，所以通过另外一个名字间接做到赋值的目的
 * @param toAssignField
 * @returns
 */
function reactiveSetterField(toAssignField: string) {
  return `_setter_${toAssignField}`;
}

export { reactiveSetterField };
