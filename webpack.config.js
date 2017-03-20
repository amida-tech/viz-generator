const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');

module.exports = {
    entry: {
        'dist/viz-generator': './src/index',
        'dist/example/line/index': './src/example/line',
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
    plugins: [new HtmlWebpackPlugin({
        filename: 'dist/example/line/index.html',
        template: 'src/example/index.html',
    })],
};
