import { compileOneFile } from '@cocojs/compiler';

function cocoMvcLoader(source: string) {
    this.cacheable(true);
    if (!source.includes('class ')) {
        return source;
    }
    try {
        const { code } = compileOneFile(source, this.resourcePath);
        return code;
    } catch (e) {
        this.emitError(e);
    }
}

export default cocoMvcLoader;
