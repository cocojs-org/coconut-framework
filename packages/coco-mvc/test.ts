export * from './index';

export {
    checkClassMetadataAsExpected,
    createDecoratorExpFactory,
    instantiateMetadata,
    addClassKindMetadata,
    addFieldKindMetadata,
    getAllMetadata,
    listClassKindMetadata,
    listFieldKindMetadata,
    findClassKindMetadataRecursively,
    listBeDecoratedClsByClassKindMetadata,
    clear,
} from 'coco-ioc-container';
// TODO: renderDecorator改为render，render改为renderApp
export { TestWebRender, RenderMeta, render as renderDecorator } from 'coco-render';
export { render, findDOMNode, unmountComponentAtNode, registerMvcApi, unregisterMvcApi, cleanCache } from 'react-dom';
