const path = require("node:path");
const process = require('node:process');
const isTest = process.env.NODE_ENV === 'test';

const packages = path.join(__dirname, '../../packages');
// todo 和tsconfig.json.path放在一起维护；
const mvc = path.join(packages, './coco-mvc/src/index.ts')
const mvcTest = path.join(packages, './coco-mvc/src/test.ts')
const render = path.join(packages, './coco-render/src/index.ts')
const renderTest = path.join(packages, './coco-render/src/test.ts')
const iocContainer = path.join(packages, './coco-ioc-container/src/index.ts')
const iocContainerTest = path.join(packages, './coco-ioc-container/src/test.ts')
const view = path.join(packages, './coco-view/src/index.ts')
const router = path.join(packages, './coco-router/src/index.ts')
const routerTest = path.join(packages, './coco-router/src/test.ts')
const shared = path.join(packages, './shared/src/index.ts')
const react = path.join(packages, './react/index.js')
const reactReconciler = path.join(packages, './react-reconciler/src/index.js')
const reactReconcilerReactWorkTags = path.join(packages, './react-reconciler/src/ReactWorkTags.js')
const reactDOM = path.join(packages, './react-dom/src/index.js')
const reactDOMFiberHostConfig = path.join(packages, './react-dom/src/client/ReactDomHostConfig.js')
const reactShared = path.join(packages, './react-shared/src/index.js')
const assignClassIdTransformer = path.join(packages, './coco-assign-class-id-transformer/src/index.ts');

const PACKAGE = {
    MVC: 'coco-mvc',
    MVC_RENDER: 'coco-render',
    IOC_CONTAINER: 'coco-ioc-container',
    VIEW: 'coco-view',
    ROUTER: 'coco-router',
    SHARED: 'shared',
    REACT: 'react',
    REACT_RECONCILER: 'react-reconciler',
    REACT_RECONCILER_REACT_WORK_TAGS: 'react-reconciler-ReactWorkTags',
    REACT_DOM: 'react-dom',
    REACT_DOM_HOST_CONFIG: 'react-dom-ReactFiberHostConfig',
    REACT_SHARED: 'react-shared',
    ASSIGN_CLASS_ID_TRANSFORMER: 'assign-class-id-transformer'
};

const pathMap = {
    [PACKAGE.MVC]: isTest ? mvcTest : mvc,
    [PACKAGE.MVC_RENDER]: isTest ? renderTest : render,
    [PACKAGE.IOC_CONTAINER]: isTest ? iocContainerTest : iocContainer,
    [PACKAGE.VIEW]: view,
    [PACKAGE.ROUTER]: isTest ? routerTest : router,
    [PACKAGE.SHARED]: shared,
    [PACKAGE.REACT]: react,
    [PACKAGE.REACT_RECONCILER]: reactReconciler,
    [PACKAGE.REACT_RECONCILER_REACT_WORK_TAGS]: reactReconcilerReactWorkTags,
    [PACKAGE.REACT_DOM]: reactDOM,
    [PACKAGE.REACT_DOM_HOST_CONFIG]: reactDOMFiberHostConfig,
    [PACKAGE.REACT_SHARED]: reactShared,
    [PACKAGE.ASSIGN_CLASS_ID_TRANSFORMER]: assignClassIdTransformer,
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