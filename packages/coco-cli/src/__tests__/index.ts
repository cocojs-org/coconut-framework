function prepareBuild(monorepoProjPath: string) {
  const Watcher = require('./build-dot-coco-process/index.js');
  const watch = new Watcher(monorepoProjPath);
  watch.doPrepareWork('build');
}

let _test_helper: {
  prepareBuild: typeof prepareBuild;
};

if (__TEST__) {
  _test_helper = {
    prepareBuild,
  };
}

export { _test_helper };
