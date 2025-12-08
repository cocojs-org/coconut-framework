export {
    Metadata,
    Autowired,
    autowired,
    Component,
    component,
    Scope,
    scope,
    SCOPE,
    Configuration,
    configuration,
    ConstructorParam,
    constructorParam,
    Target,
    target,
    type Type,
    Qualifier,
    qualifier,
    Value,
    value,
    createDecoratorExp,
    createPlaceholderDecoratorExp,
    Application,
    PropertiesConfig,
    type Decorator,
    type Field,
    KindClass,
    KindField,
    KindMethod,
} from 'coco-ioc-container';
export * from 'coco-view';
export * from 'coco-router';
export * from 'react';
export { Render, WebRender } from 'coco-render';
export { default as Api } from './decorator/metadata/api';
export { default as api } from './decorator/api';
export { default as Flow } from './decorator/metadata/flow';
export { default as flow } from './decorator/flow';
export { default as GlobalData } from './decorator/metadata/global-data';
export { default as globalData } from './decorator/global-data';
export { default as Util } from './decorator/metadata/util';
export { default as util } from './decorator/util';
export { default as WebApplication } from './decorator/metadata/web-application';
export { default as webApplication } from './decorator/web-application';
