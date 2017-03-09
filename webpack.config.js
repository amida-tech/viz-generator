const path = require('path');

module.exports = {
    entry: './index.js',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'viz-generator.js',
    },
    module: {
        rules: [
            { test: /\.(js|jsx)$/, use: 'babel-loader' },
        ],
    },
};
