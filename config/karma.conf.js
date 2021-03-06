/* @flow */

import { argv } from 'yargs';

import { getWebpackConfig } from './webpack.config';

export function getKarmaConfig(karma : Object, cfg : Object = {}) : Object {

    process.env.NODE_ENV = 'test';

    let debug          = Boolean(argv.debug);
    let quick          = Boolean(argv.quick);
    let captureConsole = Boolean(argv.console);
    let keepOpen       = Boolean(argv['keep-open']) || debug;
    let autoWatch      = Boolean(keepOpen);
    let coverage       = !argv['no-coverage'] && !quick;
    let logLevel       = argv['log-level'] || argv.loglevel || (keepOpen ? 'info' : '');
    let headless       = !keepOpen;

    // $FlowFixMe
    let browsers: string = argv.browser;

    let karmaConfig : Object = {

        files: [
            {
                pattern:  'node_modules/babel-polyfill/dist/polyfill.js',
                included: true,
                served:   true
            },

            {
                pattern:  'test/index.js',
                included: true,
                served:   true
            },

            {
                pattern:  'test/**/*.js',
                included: false,
                served:   true
            },

            {
                pattern:  'test/**/*.htm',
                included: false,
                served:   true
            }
        ],

        preprocessors: {
            'test/*.js':            [ 'webpack',  'sourcemap' ],
            'test/windows/**/*.js': [ 'webpack',  'sourcemap' ],
            'src/**/*.js':          [ 'coverage', 'sourcemap' ]
        },

        customLaunchers: {

            xChrome: {
                base:  'Chrome',
                flags: [
                    '--no-sandbox',
                    '--disable-gpu',
                    '--remote-debugging-port=9222',
                    '--remote-debugging-address=0.0.0.0',
                    // '--auto-open-devtools-for-tabs',
                    '--enable-precise-memory-info',
                    '--js-flags="--expose-gc"'
                ],
                debug
            }
        },

        reporters: [
            quick ? 'progress' : 'spec'
        ],

        autoWatch,
        logLevel: debug ? karma.LOG_DEBUG : logLevel || karma.LOG_WARN,

        basePath: __dirname,

        frameworks: [
            'mocha',
            'sinon-chai'
        ],

        client: {
            captureConsole
        },

        port: 9876,

        colors: true,

        webpackMiddleware: {
            noInfo: !debug,
            stats:  !debug
        },

        browserNoActivityTimeout:   60 * 60 * 1000,
        browserDisconnectTimeout:   30 * 1000,
        browserDisconnectTolerance: 2,
        captureTimeout:             120000,
        reportSlowerThan:           10000,

        browserConsoleLogOptions: {
            level:    debug ? 'debug' : 'error',
            format:   '%b %T: %m',
            terminal: true
        },

        singleRun: !keepOpen,
        
        ...cfg
    };

    if (browsers) {
        karmaConfig.browsers = browsers.split(',');
    } else {
        karmaConfig.browsers = [ 'xChrome' ];
    }

    if (coverage) {
        karmaConfig.reporters.push('coverage');

        karmaConfig.coverageReporter = {
            instrumenterOptions: {
                istanbul: {
                    noCompact: true
                }
            },
            reporters: [
                {
                    type: 'text'
                },
                {
                    type:   'html',
                    dir:    'coverage/',
                    subdir: '.'
                }
            ]
        };
    }
    

    if (headless) {
        karmaConfig.customLaunchers.xChrome.flags.push('--headless');
    }

    if (!karmaConfig.webpack) {
        karmaConfig.webpack = getWebpackConfig();
    }

    return karmaConfig;
}

export default (karma : Object) =>
    karma.set(getKarmaConfig(karma, {
        basePath: process.cwd()
    }));
