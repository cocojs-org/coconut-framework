const path = require("node:path");

const packages = path.join(__dirname, '../../packages');
// todo 和tsconfig.json.path放在一起维护
const mvc = path.join(packages, './coco-mvc/src/index.ts')
const render = path.join(packages, './coco-render/src/index.ts')
const iocContainer = path.join(packages, './coco-ioc-container/src/index.ts')
const iocContainerTestHelper = path.join(packages, './coco-ioc-container/src/__tests__/index.ts')
const reactive = path.join(packages, './coco-reactive/src/index.ts')
const router = path.join(packages, './coco-router/src/index.ts')
const shared = path.join(packages, './shared/src/index.ts')
const react = path.join(packages, './react/index.js')
const reactReconciler = path.join(packages, './react-reconciler/src/index.js')
const reactReconcilerReactWorkTags = path.join(packages, './react-reconciler/src/ReactWorkTags.js')
const reactDOM = path.join(packages, './react-dom/src/index.js')
const reactDOMFiberHostConfig = path.join(packages, './react-dom/src/client/ReactDomHostConfig.js')
const reactShared = path.join(packages, './react-shared/src/index.js')

const PACKAGE = {
  MVC: 'coco-mvc',
  MVC_RENDER: 'coco-render',
  IOC_CONTAINER: 'coco-ioc-container',
  IOC_CONTAINER_TEST_HELPER: 'coco-ioc-container-test-helper',
  REACTIVE: 'coco-reactive',
  ROUTER: 'coco-router',
  SHARED: 'shared',
  REACT: 'react',
  REACT_RECONCILER: 'react-reconciler',
  REACT_RECONCILER_REACT_WORK_TAGS: 'react-reconciler-ReactWorkTags',
  REACT_DOM: 'react-dom',
  REACT_DOM_HOST_CONFIG: 'react-dom-ReactFiberHostConfig',
  REACT_SHARED: 'react-shared',
};

const pathMap = {
  [PACKAGE.MVC]: mvc,
  [PACKAGE.MVC_RENDER]: render,
  [PACKAGE.IOC_CONTAINER]: iocContainer,
  [PACKAGE.IOC_CONTAINER_TEST_HELPER]: iocContainerTestHelper,
  [PACKAGE.REACTIVE]: reactive,
  [PACKAGE.ROUTER]: router,
  [PACKAGE.SHARED]: shared,
  [PACKAGE.REACT]: react,
  [PACKAGE.REACT_RECONCILER]: reactReconciler,
  [PACKAGE.REACT_RECONCILER_REACT_WORK_TAGS]: reactReconcilerReactWorkTags,
  [PACKAGE.REACT_DOM]: reactDOM,
  [PACKAGE.REACT_DOM_HOST_CONFIG]: reactDOMFiberHostConfig,
  [PACKAGE.REACT_SHARED]: reactShared,
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