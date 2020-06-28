const path = require('path');

module.exports = {
    context: path.resolve(__dirname, 'src'),
    entry: {
        example1: './example1.js',
        example2: './example2.js',
        example3: './example3.js',
        example4: './example4.js',
        example5: './example5.js',
        example6: './example6.js',
        gapminder: './gapminder.js',
        line_chart: './line_chart.js',
        area_chart: './area_chart.js',
        stacked_area_chart: './stacked_area_chart.js',
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
    },
    module: {
        rules: [
            {
                test: /\.css$/i,
                use: ['style-loader', 'css-loader']
            }
        ]
    }
}

