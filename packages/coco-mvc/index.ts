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
    Id,
    id,
    Target,
    target,
    type Type,
    Qualifier,
    qualifier,
    Value,
    value,
    createDecoratorExp,
    createPlaceholderDecoratorExp,
    getMetaClassById,
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
export { default as Api } from './src/decorator/metadata/api.ts';
export { default as api } from './src/decorator/api.ts';
export { default as Effect } from './src/decorator/metadata/effect.ts';
export { default as effect } from './src/decorator/effect.ts';
export { default as GlobalData } from './src/decorator/metadata/global-data.ts';
export { default as globalData } from './src/decorator/global-data.ts';
export { default as Util } from './src/decorator/metadata/util.ts';
export { default as util } from './src/decorator/util.ts';
export { default as WebApplication } from './src/decorator/metadata/web-application.ts';
export { default as webApplication } from './src/decorator/web-application.ts';
