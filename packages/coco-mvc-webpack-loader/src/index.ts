import { createTransformer } from 'assign-class-id-transformer';

function addStaticIdLoader(source: any) {
    this.cacheable(true);
    if (!source.includes('class ')) {
        return source;
    }
    const transformer = createTransformer(
        (msg) => this.emitWarning(new Error(msg)),
        (msg) => this.emitError(new Error(msg)),
    );
    const code = transformer(source, this.resourcePath);
    return code || source;
}

module.exports = addStaticIdLoader;