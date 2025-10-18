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
export { TestWebRender, RenderMatadata } from 'coco-render';
export { render, findDOMNode, unmountComponentAtNode, registerMvcApi, unregisterMvcApi, cleanCache } from 'react-dom';
