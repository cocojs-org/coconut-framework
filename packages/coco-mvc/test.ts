export * from './index';

export {
    checkClassMetadataAsExpected,
    createDecoratorExpFactory,
    createMetadata,
    addClassMetadata,
    addFieldMetadata,
    getAllMetadata,
    listClassMetadata,
    listFieldMetadata,
    findClassMetadata,
    listBeDecoratedClsByClassMetadata,
    listBeDecoratedClsByFieldMetadata,
    clearMetadata,
} from 'coco-ioc-container';
export { TestWebRender, RenderMatadata } from 'coco-render';
export { render, findDOMNode, unmountComponentAtNode, registerMvcApi, unregisterMvcApi, cleanCache } from 'react-dom';
