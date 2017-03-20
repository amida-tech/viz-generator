const path = require('path');

module.exports = {
    entry: {
        'dist/viz-generator': './src/index',
        'example/line/index': './example/line/line',
    },
    output: {
        path: __dirname,
        filename: '[name].js',
        library: 'vizGenerator',
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['env'],
                },
            },
            {
                test: /\.html$/,
                loader: 'raw-loader',
            },
            {
                test: /\.css*/,
                use: [{ loader: 'style-loader' }, { loader: 'css-loader' }],
            },
        ],
    },
    resolve: {
        extensions: ['.js', '.json'],
        modules: [
            path.resolve(__dirname, './src'),
            path.resolve(__dirname, './test'),
            path.resolve(__dirname, './node_modules'),
        ],
    },
};
