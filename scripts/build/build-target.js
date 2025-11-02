const path = require('node:path');
const process = require('node:process');

const isTest = process.env.NODE_ENV === 'test';
const { PACKAGE } = require("./rollup-alias");
const packages = path.join(__dirname, '../../packages');
const cocoMvc = path.join(packages, './coco-mvc');
const cocoMvcInput = path.join(cocoMvc, './src/index.ts');
const cocoMvcInputTest = path.join(cocoMvc, './src/test.ts');
const cocoMvcOutput = path.join(cocoMvc, './dist/coco-mvc.cjs.js');

const createCoco = path.join(packages, './create-coco');
const cliSrc = path.join(createCoco, './src/index.ts');
const cliDist = path.join(createCoco, '/dist/index.js');
const cliBuildDotCocoProcess = path.join(createCoco, './src/build-dot-coco-process/index.ts');
const cliBuildCotCocoDist = path.join(createCoco, '/dist/build-dot-coco-process/index.js');
const cliWebpackProcess = path.join(createCoco, './src/webpack-process/index.ts');
const cliWebpackDist = path.join(createCoco, '/dist/webpack-process/index.js');

module.exports.rollupTargets = [
  {
    input: isTest ? cocoMvcInputTest : cocoMvcInput,
    output: {
      file: cocoMvcOutput,
      format: 'cjs',
    },
    alias: [
      PACKAGE.MVC,
      PACKAGE.MVC_RENDER,
      PACKAGE.VIEW,
      PACKAGE.ROUTER,
      PACKAGE.IOC_CONTAINER,
      PACKAGE.SHARED,
      PACKAGE.REACT,
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
