(function ($module) {
    var allJS = [
        'app/components/babel-polyfill/browser-polyfill.js',
        'app/components/html5-boilerplate/dist/js/vendor/modernizr-2.8.3.min.js',
        'app/components/bluebird/js/browser/bluebird.js',

        'app/components/angular/angular.js',
        'app/components/angular-animate/angular-animate.js',
        'app/components/angular-route/angular-route.js',
        'app/components/angular-mocks/angular-mocks.js',
        'app/components/angular-elastic/elastic.js',
        'app/components/jquery/dist/jquery.js',
        'app/components/bootstrap/dist/js/bootstrap.js',
        'app/components/angular-bootstrap/ui-bootstrap.js',
        'app/components/angular-bootstrap/ui-bootstrap-tpls.js',
        'app/components/angular-backtop/dist/angular-backtop.js',
        'app/components/ng-file-upload/ng-file-upload-shim.js',
        'app/components/ng-file-upload/ng-file-upload.js',

        'app/apy-rest2front/core/namespace.js',
        'app/apy-rest2front/core/errors/bases.js',
        'app/apy-rest2front/core/errors/eve.js',
        'app/apy-rest2front/core/helpers.js',
        'app/apy-rest2front/core/components/base.js',
        'app/apy-rest2front/core/components/mixins.js',
        'app/apy-rest2front/core/components/fields/field.js',
        'app/apy-rest2front/core/components/fields/media.js',
        'app/apy-rest2front/core/components/fields/number.js',
        'app/apy-rest2front/core/components/fields/string.js',
        'app/apy-rest2front/core/components/fields/boolean.js',
        'app/apy-rest2front/core/components/fields/datetime.js',
        'app/apy-rest2front/core/components/fields/list.js',
        'app/apy-rest2front/core/components/fields/embedded.js',
        'app/apy-rest2front/core/components/fields/nested.js',
        'app/apy-rest2front/core/components/fields/field.js',
        'app/apy-rest2front/core/components/fields/geo/point.js',
        'app/apy-rest2front/core/components/fields/poly.js',
        'app/apy-rest2front/core/components/resource.js',
        'app/apy-rest2front/core/components/collection.js',
        'app/apy-rest2front/core/components/schemas.js',
        'app/apy-rest2front/core/core.js',

        'app/apy-rest2front/integration/angular/view.js',
        'app/apy-rest2front/integration/angular/directives/field.js',
        'app/apy-rest2front/integration/angular/directives/version/version.js',
        'app/apy-rest2front/integration/angular/directives/version/version-directive.js',
        'app/apy-rest2front/integration/angular/directives/version/interpolate-filter.js',
        'app/apy-rest2front/integration/angular/services.js',
        'app/apy-rest2front/integration/angular/app.js',
        'tests/**/*.js'
    ];
    var jsFiles = allJS.slice(0, -1);
    var paths = {
        cwd: '.',
        outDir: 'build',
        appDir: 'build/app',
        dev: {
            files: {
                src: [
                    'build/app/apy-rest2front.min.js.map',
                    'build/app/apy-rest2front.min.css.map'
                ]
            } 
        },
        js: {
            minified: 'apy-rest2front.min.js',
            files: {
                src: jsFiles
            },
            dest: 'build/app/scripts'
        },
        css: {
            minified: 'apy-rest2front.min.css',
            files: {
                src: [
                    'app/components/html5-boilerplate/dist/css/normalize.css',
                    'app/components/html5-boilerplate/dist/css/main.css',
                    'app/components/bootstrap/dist/css/bootstrap.min.css',
                    'app/components/angular-backtop/dist/angular-backtop.css',
                    'app/apy-rest2front/integration/angular/login.css',
                    'app/apy-rest2front/integration/common/css/core.css',
                    'app/apy-rest2front/integration/common/css/responsive.css'
                ]
            },
            dest: 'build/app/scripts'
        },
        html: {
            files: {
                src: [
                    'app/apy-rest2front/integration/angular/view.html',
                    'app/apy-rest2front/integration/angular/login.html',
                    'app/index.html'
                ]
            }
        },
        fonts: {
            dest: 'build/app/fonts',
            files: {
                src: [
                    'app/components/bootstrap/dist/fonts/*.{eot,svg,ttf,woff,woff2}'
                ]
            }
        },
        icons: {
            files: {
                src: [
                    'app/apy-rest2front/integration/common/*.ico'
                ]
            }
        },
        doc: {
            src: [
                'README.md',
                'app/apy-rest2front/**/*.js',
                'app/apy-rest2front/**/**/*.js',
                'app/apy-rest2front/**/**/**/*.js',
                'app/apy-rest2front/**/**/**/**/*.js',
                'tests/apy-rest2front/common/*.js'
            ],
            files: {
                static: {
                    src: ["./app/apy-rest2front/integration/common/favicon.ico"]
                },
                design: {
                    src: [
                        "design/apy-rest2front-avatar.png",
                        "design/UML_classes_diagram.png",
                        "design/UML_classes_diagram800x610.png"
                    ],
                    dest: 'build/docs/design'
                }
            },
            dest: 'build/docs'
        },
        coverage: {
            report: 'build/coverage/report.json',
            dest: 'build/coverage/'
        },
        eslint: {
            src: [
                'app/apy-rest2front/**/*.js',
                'app/apy-rest2front/**/**/*.js',
                'app/apy-rest2front/**/**/**/*.js',
                'app/apy-rest2front/**/**/**/**/*.js'
            ],
            report: 'build/eslint-report.json'
        }
    };

    $module.exports = {
        gulp: {
            dev: false,
            allJS: allJS,
            paths: paths,
            minifyHTMLOpts: {
                minifyCSS: true,
                removeComments: true,
                collapseWhitespace: true
            },
            minifyJSOpts: {},
            minifyCSSOpts: {},
            jsdoc3: {
                "tags": {
                    "allowUnknownTags": true
                },
                "source": {
                    "excludePattern": "(^|\\/|\\\\)_"
                },
                "recurse": true,
                "opts": {
                    "destination": paths.doc.dest
                },
                "plugins": [
                    "plugins/markdown"
                ],
                "templates": {
                    "cleverLinks": false,
                    "monospaceLinks": false,
                    "default": {
                        "outputSourceFiles": true,
                        "staticFiles": {
                            "paths": paths.doc.files.static.src
                        }
                    },
                    "path": "ink-docstrap",
                    "theme": "flatly",
                    "navType": "vertical",
                    "linenums": true,
                    "dateFormat": "MMMM Do YYYY, h:mm:ss a"
                }
            },
            karma: {
                basePath : './',
                files : allJS,

                autoWatch : true,
                frameworks: ['jasmine'],
                // enable / disable colors in the output (reporters and logs)
                // CLI --colors --no-colors
                colors: true,
                //browsers : ['Chrome', 'ChromeCanary', 'Firefox', 'PhantomJS'],
                browsers : ['PhantomJS'],
                plugins : [
                    'karma-jasmine',
                    'karma-coverage',
                    'karma-chrome-launcher',
                    'karma-firefox-launcher',
                    'karma-phantomjs-launcher',
                    'karma-threshold-reporter'
                ],
                // coverage reporter generates the coverage
                reporters: ['progress', 'coverage', 'threshold'],
                preprocessors: {
                    // source files, that you wanna generate coverage for
                    // do not include tests or libraries
                    // (these files will be instrumented by Istanbul)
                    '**/app/apy-rest2front/**/!(test_)*.js': ['coverage']
                },
                // Coverage minimal thresholds
                // FIXME: raise up to 90%
                thresholdReporter: {
                    statements: 75,
                    branches: 60,
                    functions: 70,
                    lines: 75
                },
                // Configure the reporter
                coverageReporter: {
                    type : 'html',
                    dir : paths.coverage.dest,
                    instrumenterOptions: {
                        istanbul: {
                            noCompact: true
                        }
                    },
                    includeAllSources: true
                }
            }
        }
    };
})( module );