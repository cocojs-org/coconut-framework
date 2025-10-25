/**
 * 提供coco-mvc的公共实例和方法，方便reconciler获取元数据等能力
 */
let _application = null; // 应用实例

function getCommonApi() {
  if (!_application) {
    throw new Error('公共实例或方法还未赋值');
  }
  return {
    application: _application,
  };
}

/**
 * 注册公共方法
 * @param application
 */
function registerCommonApi(application) {
  if (_application) {
    throw new Error('已经注入了公共实例或方法，重复注入是一个bug，请检查');
  }
  _application = application;
}

/**
 * 清空公共方法
 */
function unregisterCommonApi() {
  _application = null;
}

export {
  getCommonApi as getMvcApi ,
  registerCommonApi as registerMvcApi,
  unregisterCommonApi as unregisterMvcApi,
}