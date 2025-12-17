import { createTransformer } from 'assign-class-id-transformer';

function addStaticIdLoader(source: any) {
    const filename = this.resourcePath;

     const transformer = createTransformer(
         (msg) => this.emitWarning(new Error(msg)),
         (msg) => this.emitError(new Error(msg)),
     );
     const code = transformer(source, filename);
     return code || source;
}

module.exports = addStaticIdLoader;