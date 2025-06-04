/**
 * reconciler需要调用ioc容器的能力创建组件，而不是简单的实例化
 * 为了不破坏react reconciler整体的代码结构，所以额外新增了一个文件
 */
let app = null;

function getApplication() {
  return app;
}

/**
 * 应用启动时，注册当前应用，便于调和模块使用
 * @param application
 */
function registerApplication(application) {
  if (app !== null) {
    console.error('重复注入应用');
    return;
  }
  app = application;
}

/**
 * 应用结束时，取消注册当前应用
 */
function unregisterApplication() {
  app = null;
}

export {
  getApplication,
  registerApplication,
  unregisterApplication,
}