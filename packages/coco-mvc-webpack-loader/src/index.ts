import { compileOneFile } from 'coco-compiler';

function addStaticIdLoader(source: any) {
    this.cacheable(true);
    if (!source.includes('class ')) {
        return source;
    }
    try {
        const { code } = compileOneFile(source, this.resourcePath);
        return code;
    } catch (e: any) {
        this.emitError(e);
    }
}

module.exports = addStaticIdLoader;
