const path = require('node:path');
const { PACKAGE } = require("./rollup-alias");
const packages = path.join(__dirname, '../../packages');
const cocoMvc = path.join(packages, './coco-mvc');
const cocoMvcInput = path.join(cocoMvc, './src/index.ts');
const cocoMvcOutput = path.join(cocoMvc, './dist/coco-mvc.cjs.js');

const cocoCli = path.join(packages, './coco-cli');
const cliSrc = path.join(cocoCli, './src/index.ts');
const cliDist = path.join(cocoCli, '/dist/index.js');
const cliBuildDotCocoProcess = path.join(cocoCli, './src/build-dot-coco-process/index.ts');
const cliBuildCotCocoDist = path.join(cocoCli, '/dist/build-dot-coco-process/index.js');
const cliWebpackProcess = path.join(cocoCli, './src/webpack-process/index.ts');
const cliWebpackDist = path.join(cocoCli, '/dist/webpack-process/index.js');

module.exports.rollupTargets = [
  {
    input: cocoMvcInput,
    output: {
      file: cocoMvcOutput,
      format: 'cjs',
    },
    alias: [
      PACKAGE.MVC,
      PACKAGE.MVC_RENDER,
      PACKAGE.REACTIVE,
      PACKAGE.ROUTER,
      PACKAGE.IOC_CONTAINER,
      PACKAGE.IOC_CONTAINER_TEST_HELPER,
      PACKAGE.REACT_REACT,
      PACKAGE.REACT_DOM,
      PACKAGE.REACT_DOM_HOST_CONFIG,
      PACKAGE.REACT_RECONCILER,
      PACKAGE.REACT_RECONCILER_REACT_WORK_TAGS,
      PACKAGE.REACT_SHARED,
    ],
  },
  {
    input: cliSrc,
    output: {
      file: cliDist,
      format: 'cjs'
    }
  },
  {
    input: cliBuildDotCocoProcess,
    output: {
      file: cliBuildCotCocoDist,
      format: 'cjs'
    },
  },
  {
    input: cliWebpackProcess,
    output: {
      file: cliWebpackDist,
      format: 'cjs'
    },
  }
];
