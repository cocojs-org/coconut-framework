function buildDotCoco(monorepoProjPath: string) {
    const Builder = require('./build-dot-coco-process/index.js');
    const builder = new Builder(monorepoProjPath);
    builder.build();
}

let _test_helper: {
    buildDotCoco: typeof buildDotCoco;
};

if (__TEST__) {
    _test_helper = {
        buildDotCoco,
    };
}

export { _test_helper };
