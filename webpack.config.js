const path = require('path');

module.exports = {
    entry: './src/index',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'viz-generator.js',
        library: 'vizGenerator',
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['env'],
                },
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
