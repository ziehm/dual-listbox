const clone = require('clone');
const paths = require('./build/paths');
const webpackConfig = clone(require('./webpack.config.js'));


// Add istanbul-instrumenter to webpack configuration
webpackConfig.module.rules.push({
    test: /\.js$/,
    include: __dirname + '/' + paths.jsSrcDir,
    loader: 'istanbul-instrumenter-loader',
    enforce: 'post',

    options: {
        esModules: true
    }
});

webpackConfig.output.filename += '.test';
webpackConfig.plugins = undefined;
webpackConfig.externals = undefined;
webpackConfig.target = undefined;


// The preprocessor config
const preprocessors = {};
preprocessors[paths.jsSpecEntry] = [
    'webpack'
];


function ConfigException(message) {
    this.message = message;
    this.name = 'ConfigException';
}


// The main configuration
module.exports = function (config) {
    if (process.env.CI && (!process.env.SAUCE_USERNAME || !process.env.SAUCE_ACCESS_KEY)) {
        throw ConfigException('Make sure the SAUCE_USERNAME and SAUCE_ACCESS_KEY environment variables are set.');
    }

    // https://wiki.saucelabs.com/display/DOCS/Platform+Configurator#/
    const customLaunchers = {
        sl_chrome: {
            base: 'SauceLabs',
            browserName: 'chrome',
            platform: 'Windows 10',
            version: 'latest'
        },
        sl_chrome_2: {
            base: 'SauceLabs',
            browserName: 'chrome',
            platform: 'Windows 10',
            version: 'latest-1'
        },
        sl_edge: {
            base: 'SauceLabs',
            browserName: 'MicrosoftEdge',
            platform: 'Windows 10',
            version: 'latest'
        },
        sl_edge_2: {
            base: 'SauceLabs',
            browserName: 'MicrosoftEdge',
            platform: 'Windows 10',
            version: '14.14393'
        },
        sl_safari_1: {
            base: 'SauceLabs',
            browserName: 'safari',
            platform: 'macOS 11.00',
            version: 'latest'
        },
        sl_safari_2: {
            base: 'SauceLabs',
            browserName: 'safari',
            platform: 'macOS 10.13',
            version: '12.1'
        },
        sl_firefox: {
            base: 'SauceLabs',
            browserName: 'firefox',
            platform: 'Windows 10',
            version: 'latest'
        },
        sl_firefox_2: {
            base: 'SauceLabs',
            browserName: 'firefox',
            platform: 'Windows 10',
            version: 'latest-1'
        },
    }

    config.set({
        frameworks: [
            'fixture',
            'jasmine-ajax',
            'jasmine'
        ],

        files: [
            'node_modules/@babel/polyfill/dist/polyfill.js',
            paths.jsSpecEntry
        ],

        preprocessors: preprocessors,

        webpack: webpackConfig,

        webpackMiddleware: {
            noInfo: true
        },

        hostname: 'localhost',

        sauceLabs: {
            testName: 'dual-listbox browser testing',
            username: process.env.SAUCE_USERNAME,
            accessKey: process.env.SAUCE_ACCESS_KEY,
            tunnelIdentifier: process.env.GITHUB_RUN_ID,
        },

        autoWatch: process.env.CI ? false: true,
        singleRun: process.env.CI ? true: false,
        browserNoActivityTimeout: 200000,
        captureTimeout: 200000,
        concurrency: 5,
        customLaunchers: customLaunchers,
        retryLimit: 5,

        browsers: (process.env.CI) ? Object.keys(customLaunchers) : ['Chrome', 'Firefox'],
        reporters: (process.env.CI) ? ['spec', 'coverage', 'saucelabs', 'coveralls'] : ['spec', 'coverage'],

        specReporter: {
            suppressSkipped: true,
        },

        coverageReporter: {
            dir: paths.coverageDir,
            reporters: [
                {type: 'html'},
                {type: 'text'},
                {type: 'text-summary'},
            ]
        },
    });
};
