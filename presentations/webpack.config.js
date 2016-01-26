module.exports = {
    entry: {
        //account: './src/js/account.js',
        test: './src/js/test.js'
        //export: './src/js/export.js'
    },
    output: {
        path: __dirname,
        filename: "bundle.js"
    },
    module: {
      loaders: [
        { test: /\.js$/, exclude: /node_modules/, loader: "babel-loader"}
      ]
    }
};