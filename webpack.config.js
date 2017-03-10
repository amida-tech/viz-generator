const path = require('path');

module.exports = {
    entry: './viz',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'viz-generator.js',
        library: 'vizGenerator',
    },
    module: {
        loaders: [
            {
                test: /\.(js|jsx)$/,
                exclude: /(node_modules|bower_components)/,
                loader: 'babel-loader',
                query: {
                    presets: ['env'],
                },
            },
        ],
    },
    resolve: {
        extensions: ['.js'],
        modules: [
            __dirname,
            path.resolve(__dirname, './node_modules'),
        ],
    },
};
