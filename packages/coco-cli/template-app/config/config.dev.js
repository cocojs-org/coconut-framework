const path = require('node:path');
const process = require('node:process');

const config = {
  webpack: {
    mode: 'development',
    devServer: {
      static: {
        directory: path.join(process.cwd(), 'dist'),
      },
    },
  },
};

module.exports = config;
