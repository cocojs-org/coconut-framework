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
    const start = Date.now();
    const code = transformer(source, this.resourcePath);
    if (code) {
        console.info('===trans', this.resourcePath, Date.now() - start);
    }
    return code || source;
}

module.exports = addStaticIdLoader;