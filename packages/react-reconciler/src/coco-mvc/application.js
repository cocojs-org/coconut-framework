/**
 * 提供当前应用实例，方便reconciler获取元数据和装饰器参数
 */
let _application = null;
let _getMetaClassById = null;

function getApplication() {
  if (!_application || !_getMetaClassById) {
    throw new Error('公共实例或方法还未赋值');
  }
  return {
    application: _application,
    getMetaClassById: _getMetaClassById,
  };
}

/**
 * 应用启动时，注册当前应用，便于调和模块使用
 * @param application
 * @param getMetaClassById
 */
function registerApplication(application, getMetaClassById) {
  if (_application || _getMetaClassById) {
    throw new Error('已经注入了公共实例或方法，重复注入是一个bug，请检查');
  }
  _application = application;
  _getMetaClassById = getMetaClassById;
}

/**
 * 应用结束时，取消注册当前应用
 */
function unregisterApplication() {
  _application = null;
  _getMetaClassById = null;
}

export {
  getApplication,
  registerApplication,
  unregisterApplication,
}