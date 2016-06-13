module.exports = function(config){
    config.set({

        basePath : './',

        files : [
            'app/components/angular/angular.js',
            'app/components/jquery/dist/jquery.min.js',
            'app/components/angular-route/angular-route.js',
            'app/components/angular-mocks/angular-mocks.js',

            'app/apy-frontend/core/helper.js',
            'app/apy-frontend/core/components/base.js',
            'app/apy-frontend/core/components/fields/field.js',

            'app/apy-frontend/core/components/fields/media.js',
            'app/apy-frontend/core/components/fields/number.js',
            'app/apy-frontend/core/components/fields/string.js',
            'app/apy-frontend/core/components/fields/hashmap.js',
            'app/apy-frontend/core/components/fields/boolean.js',
            'app/apy-frontend/core/components/fields/datetime.js',
            'app/apy-frontend/core/components/fields/objectid.js',
            'app/apy-frontend/core/components/fields/list.js',
            'app/apy-frontend/core/components/fields/field.js',
            'app/apy-frontend/core/components/fields/geo/point.js',
            'app/apy-frontend/core/components/fields/poly.js',

            'app/apy-frontend/core/components/resource.js',
            'app/apy-frontend/core/components/collection.js',

            'app/apy-frontend/core/core.js',

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
