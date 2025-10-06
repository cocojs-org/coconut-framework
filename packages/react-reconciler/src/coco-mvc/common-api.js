/**
 * 提供coco-mvc的公共实例和方法，方便reconciler获取元数据等能力
 */
let _application = null; // 应用实例
let _getMetaClassById = null;

function getCommonApi() {
  if (!_application || !_getMetaClassById) {
    throw new Error('公共实例或方法还未赋值');
  }
  return {
    application: _application,
    getMetaClassById: _getMetaClassById,
  };
}

/**
 * 注册公共方法
 * @param application
 * @param getMetaClassById
 */
function registerCommonApi(application, getMetaClassById) {
  if (_application || _getMetaClassById) {
    throw new Error('已经注入了公共实例或方法，重复注入是一个bug，请检查');
  }
  _application = application;
  _getMetaClassById = getMetaClassById;
}

/**
 * 清空公共方法
 */
function unregisterCommonApi() {
  _application = null;
  _getMetaClassById = null;
}

export {
  getCommonApi as getMvcApi ,
  registerCommonApi as registerMvcApi,
  unregisterCommonApi as unregisterMvcApi,
}