const config = {
    webpack: {
        output: {
            publicPath: '/',
        },
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

export default config;
