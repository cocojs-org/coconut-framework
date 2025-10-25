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
} from 'coco-ioc-container';
export { TestWebRender, RenderMeta, render } from 'coco-render';
export {
    render as renderIntoContainer,
    findDOMNode,
    unmountComponentAtNode,
    registerMvcApi,
    unregisterMvcApi,
    cleanCache,
} from 'react-dom';
