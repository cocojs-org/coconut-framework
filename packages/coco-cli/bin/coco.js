#!/usr/bin/env node
const { cli } = require('../dist/index.js');
const [, , domain, ...args] = process.argv;

cli('', domain, args);
