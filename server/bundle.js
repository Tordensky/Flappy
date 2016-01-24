var Webpack = require('webpack');
var WebpackDevServer = require('webpack-dev-server');
var webpackConfig = require('./../webpack.config.js');
var path = require('path');
var fs = require('fs');
var mainPath = path.resolve(__dirname, '..', 'app', 'main.js');

module.exports = function () {
    // First we fire up webpack and pass in the config we created
    var bundleStart = null;
    var compiler = Webpack(webpackConfig);

    // We give notice in terminal when it
    // starts bundling and set the time it started
    compiler.plugin('compile', function() {
        console.log('Bundling...');
        bundleStart = Date.now();
    });

    compiler.plugin('done', function() {
        console.log('Bundeled in ' + (Date.now() - bundleStart) + 'ms!');
    });

    // We need to tell Webpack to serve our bundled app from the the buld path.
    // When proxying: http://localhost:3000/build -> http://localhost:8080/build
    var bundler = new WebpackDevServer(compiler, {
        publicPath: '/build/',

        // Configure hot replacement
        hot: true,

        // The rest is terminal conf
        quiet: false,
        noInfo: true,
        stats: {
            colors: true
        }
    });

    bundler.listen(8080, 'localhost', function () {
        console.log('Bundling project, please wait...');
    });
};