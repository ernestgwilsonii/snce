module.exports = {
    entry: './src/content.js',
    output: {
        path: __dirname,
        filename: './dist/content.js'
    },
    externals: {
        "ramda": "R"
    },
    module: {
        loaders: [
            {
                test: /\.js$/,
                loader: 'babel-loader'
            }
        ]
    },
    devtool: 'source-map'
};