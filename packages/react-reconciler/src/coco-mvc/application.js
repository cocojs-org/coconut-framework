/**
 * 提供当前应用实例，方便reconciler获取元数据和装饰器参数
 */
let _application = null;

function getApplication() {
  return _application;
}

/**
 * 应用启动时，注册当前应用，便于调和模块使用
 * @param application
 */
function registerApplication(application) {
  if (_application !== null) {
    console.error('重复注入应用');
    return;
  }
  _application = application;
}

/**
 * 应用结束时，取消注册当前应用
 */
function unregisterApplication() {
  _application = null;
}

export {
  getApplication,
  registerApplication,
  unregisterApplication,
}