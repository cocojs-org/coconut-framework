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
export { default as Api } from './decorator/metadata/api.ts';
export { default as api } from './decorator/api.ts';
export { default as Effect } from './decorator/metadata/effect.ts';
export { default as effect } from './decorator/effect.ts';
export { default as GlobalData } from './decorator/metadata/global-data.ts';
export { default as globalData } from './decorator/global-data.ts';
export { default as Util } from './decorator/metadata/util.ts';
export { default as util } from './decorator/util.ts';
export { default as WebApplication } from './decorator/metadata/web-application.ts';
export { default as webApplication } from './decorator/web-application.ts';
