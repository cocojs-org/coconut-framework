const path = require("node:path");

const packages = path.join(__dirname, '../../packages');
// todo 和tsconfig.json.path放在一起维护
const mvc = path.join(packages, './coco-mvc/src/index.ts')
const render = path.join(packages, './coco-render/src/index.ts')
const reconciler = path.join(packages, './coconut-reconciler/src/index.js')
const web = path.join(packages, './coconut-web/src/index.js')
const iocContainer = path.join(packages, './coco-ioc-container/src/index.ts')
const iocContainerTestHelper = path.join(packages, './coco-ioc-container/src/__tests__/index.ts')
const reactive = path.join(packages, './coco-reactive/src/index.ts')
const router = path.join(packages, './coco-router/src/index.ts')
// todo 支持@
const shared = path.join(packages, './shared/src/index.ts')
const ReactFiberHostConfig = path.join(packages, './coconut-web/src/client/ReactDomHostConfig.js')

const PACKAGE = {
  MVC: 'coco-mvc',
  MVC_RENDER: 'coco-render',
  RECONCILER: 'coconut-reconciler',
  WEB: 'coconut-web',
  IOC_CONTAINER: 'coco-ioc-container',
  IOC_CONTAINER_TEST_HELPER: 'coco-ioc-container-test-helper',
  REACTIVE: 'coco-reactive',
  ROUTER: 'coco-router',
  HOST_CONFIG: 'ReactFiberHostConfig',
  SHARED: 'shared',
};

const pathMap = {
  [PACKAGE.MVC]: mvc,
  [PACKAGE.MVC_RENDER]: render,
  [PACKAGE.RECONCILER]: reconciler,
  [PACKAGE.WEB]: web,
  [PACKAGE.IOC_CONTAINER]: iocContainer,
  [PACKAGE.IOC_CONTAINER_TEST_HELPER]: iocContainerTestHelper,
  [PACKAGE.REACTIVE]: reactive,
  [PACKAGE.ROUTER]: router,
  [PACKAGE.HOST_CONFIG]: ReactFiberHostConfig,
  [PACKAGE.SHARED]: shared
}

function genEntries(config) {
  return (config || []).map(name => ({
    find: name,
    replacement: pathMap[name],
  }))
}

module.exports = {
  PACKAGE,
  genEntries
};