#!/usr/bin/env node
const { cli } = require('../dist/create-coco.js');
const [, , type] = process.argv;

cli('', type);
