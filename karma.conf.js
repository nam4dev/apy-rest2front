module.exports = function(config){
    config.set({
        basePath : './',
        files : [
            'app/components/babel-polyfill/browser-polyfill.js',
            'app/components/angular/angular.js',
            'app/components/jquery/dist/jquery.min.js',
            'app/components/angular-route/angular-route.js',
            'app/components/angular-mocks/angular-mocks.js',

            'app/apy-frontend/core/helper.js',
            'app/apy-frontend/core/components/base.js',
            'app/apy-frontend/core/components/common.js',
            'app/apy-frontend/core/components/fields/field.js',

            'app/apy-frontend/core/components/fields/media.js',
            'app/apy-frontend/core/components/fields/number.js',
            'app/apy-frontend/core/components/fields/string.js',
            'app/apy-frontend/core/components/fields/boolean.js',
            'app/apy-frontend/core/components/fields/datetime.js',
            'app/apy-frontend/core/components/fields/list.js',
            'app/apy-frontend/core/components/fields/embedded.js',
            'app/apy-frontend/core/components/fields/nested.js',
            'app/apy-frontend/core/components/fields/field.js',
            'app/apy-frontend/core/components/fields/geo/point.js',
            'app/apy-frontend/core/components/fields/poly.js',

            'app/apy-frontend/core/components/resource.js',
            'app/apy-frontend/core/components/collection.js',

            'app/apy-frontend/core/schemas.js',
            'app/apy-frontend/core/core.js',

            'app/apy-frontend/integration/angular/view.js',
            'app/apy-frontend/integration/angular/directives/field.js',
            'app/apy-frontend/integration/angular/app.js',

            'app/apy-frontend/integration/angular/directives/version/version.js',
            'app/apy-frontend/integration/angular/directives/version/version-directive.js',
            'app/apy-frontend/integration/angular/directives/version/interpolate-filter.js',
            'app/apy-frontend/**/tests/**/*.js'
        ],

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
            '**/app/apy-frontend/**/!(test_)*.js': ['coverage']
        },
        // Coverage minimal thresholds
        // FIXME: raise up to 90%
        thresholdReporter: {
            statements: 87.25,
            branches: 76.5,
            functions: 85,
            lines: 87.5
        },
        // Configure the reporter
        coverageReporter: {
            type : 'html',
            dir : 'coverage/',
            instrumenterOptions: {
                istanbul: {
                    noCompact: true
                }
            },
            includeAllSources: true
        }
    });
};
