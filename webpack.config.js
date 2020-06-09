const path = require('path');

module.exports = {
    context: path.resolve(__dirname, 'src'),
    entry: {
        example1: './example1.js',
        example2: './example2.js',
        example3: './example3.js',
        example4: './example4.js',
        scales: './scales.js'
    },
    mode: 'development',
    output: {
        path: path.resolve(__dirname, 'public/js'),
        publicPath: 'js',
        filename: './[name].js'
    },
    devServer: {
        open: true,
        watchContentBase: true,
        contentBase: './public'
    }
}

