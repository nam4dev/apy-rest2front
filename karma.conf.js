module.exports = function(config){
    config.set({

        basePath : './',

        files : [
            'app/components/angular/angular.js',
            'app/components/angular-route/angular-route.js',
            'app/components/angular-mocks/angular-mocks.js',
            'app/apy-frontend/core/helper.js',
            'app/apy-frontend/core/components/base.js',
            'app/apy-frontend/core/components/fields/field.js',
            'app/apy-frontend/core/components/fields/string.js',
            'app/apy-frontend/frameworks/front/angular/directives/version/version.js',
            'app/apy-frontend/frameworks/front/angular/directives/version/version-directive.js',
            'app/apy-frontend/frameworks/front/angular/directives/version/interpolate-filter.js',
            'app/apy-frontend/**/tests/**/*.js'
        ],

        autoWatch : true,
        frameworks: ['jasmine'],
        //browsers : ['Chrome', 'ChromeCanary', 'Firefox', 'PhantomJS'],
        browsers : ['PhantomJS'],
        plugins : [
            'karma-chrome-launcher',
            'karma-firefox-launcher',
            'karma-phantomjs-launcher',
            'karma-jasmine',
            'karma-junit-reporter'
        ],

        junitReporter : {
            outputFile: 'test_out/unit.xml',
            suite: 'unit'
        }

    });
};
