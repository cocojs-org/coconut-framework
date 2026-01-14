const process = require('node:process');

const isTest = process.env.NODE_ENV === 'test';

module.exports = {
    isTest
}
