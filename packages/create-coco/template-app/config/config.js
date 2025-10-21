const path = require('node:path');
const process = require('node:process');

const config = {
    webpack: {
        module: {
            rules: [
                {
                    test: /\.css$/i,
                    use: [
                        'style-loader',
                        'css-loader',
                        {
                            loader: 'postcss-loader',
                        },
                    ],
                },
            ],
        },
    },
};

module.exports = config;
