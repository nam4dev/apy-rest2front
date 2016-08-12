var fs = require('fs');
var gulp = require('gulp');
var gp_if = require('gulp-if');
var mkdirp = require('mkdirp');
var gp_clean = require('gulp-clean');
var gp_jsdoc3 = require('gulp-jsdoc3');
var gp_concat = require('gulp-concat');
var gp_rename = require('gulp-rename');
var gp_uglify = require('gulp-uglify');
var gp_eslint = require('gulp-eslint');
var gp_cssnano = require('gulp-cssnano');
var exec = require('child_process').exec;
var karmaServer = require('karma').Server;
var gp_sourcemaps = require('gulp-sourcemaps');
var gp_htmlmin = require('gulp-html-minifier');
var karmaThreshold = require('./apy.conf').karma.thresholdReporter;

var paths = new function () {
    return {
        cwd: '.',
        outDir: 'build',
        appDir: 'build/app',
        outJsMin: 'apy-rest2front.min.js',
        outCssMin: 'apy-rest2front.min.css',
        devFiles: [
            'build/app/apy-rest2front.min.js.map',
            'build/app/apy-rest2front.min.css.map'
        ],
        jsFiles: [
            'app/components/babel-polyfill/browser-polyfill.js',
            'app/components/html5-boilerplate/dist/js/vendor/modernizr-2.8.3.js',
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

            'app/apy-rest2front/core/errors.js',
            'app/apy-rest2front/core/helper.js',
            'app/apy-rest2front/core/components/base.js',
            'app/apy-rest2front/core/components/common.js',
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
            'app/apy-rest2front/core/schemas.js',
            'app/apy-rest2front/core/core.js',

            'app/apy-rest2front/integration/angular/view.js',
            'app/apy-rest2front/integration/angular/directives/field.js',
            'app/apy-rest2front/integration/angular/directives/version/version.js',
            'app/apy-rest2front/integration/angular/directives/version/version-directive.js',
            'app/apy-rest2front/integration/angular/directives/version/interpolate-filter.js',
            'app/apy-rest2front/integration/angular/services.js',
            'app/apy-rest2front/integration/angular/app.js'
        ],
        cssFiles: [
            'app/components/html5-boilerplate/dist/css/normalize.css',
            'app/components/html5-boilerplate/dist/css/main.css',
            'app/components/bootstrap/dist/css/bootstrap.min.css',
            'app/components/angular-backtop/dist/angular-backtop.css',
            'app/apy-rest2front/integration/angular/login.css',
            'app/apy-rest2front/integration/common/css/core.css',
            'app/apy-rest2front/integration/common/css/responsive.css'
        ],
        htmlFiles: [
            'app/apy-rest2front/integration/angular/view.html',
            'app/apy-rest2front/integration/angular/login.html',
            'app/index.html'
        ],
        fontFiles: [
            'app/components/bootstrap/dist/fonts/*.{eot,svg,ttf,woff,woff2}'
        ],
        iconFiles: [
            'app/apy-rest2front/integration/common/*.ico'
        ]
    }
}();

var config = {
    dev: false,
    paths: paths,
    minifyHTMLOpts: {
        minifyCSS: true,
        removeComments: true,
        collapseWhitespace: true
    },
    minifyJSOpts: {},
    minifyCSSOpts: {}
};

gulp.task('clean', () => {
    return gulp.src(config.paths.devFiles, {read: false})
        .pipe(gp_if(!config.dev, gp_clean()))
});

gulp.task('minify-css', () => {
    return gulp.src(config.paths.cssFiles)
        .pipe(gp_if(config.dev, gp_sourcemaps.init()))
        .pipe(gp_concat(config.paths.outCssMin))
        .pipe(gp_cssnano(config.minifyCSSOpts))
        .pipe(gp_if(config.dev, gp_sourcemaps.write(config.paths.cwd)))
        .pipe(gulp.dest(config.paths.appDir + '/scripts'))
});

gulp.task('minify-js', () => {
    return gulp.src(config.paths.jsFiles)
        .pipe(gp_if(config.dev, gp_sourcemaps.init()))
        .pipe(gp_concat(config.paths.outJsMin))
        .pipe(gp_uglify(config.minifyJSOpts))
        .pipe(gp_if(config.dev, gp_sourcemaps.write(config.paths.cwd)))
        .pipe(gulp.dest(config.paths.appDir + '/scripts'))
});

gulp.task('minify-html', () => {
    return gulp.src(config.paths.htmlFiles)
        .pipe(gp_htmlmin(config.minifyHTMLOpts))
        .pipe(gulp.dest(config.paths.appDir))
});

gulp.task('copy-fonts', () => {
    return gulp.src(config.paths.fontFiles)
        .pipe(gulp.dest(config.paths.appDir + '/fonts'))
});

gulp.task('copy-icons', () => {
    return gulp.src(config.paths.iconFiles)
        .pipe(gulp.dest(config.paths.appDir))
});

gulp.task('prepare', (done) => {
    mkdirp(config.paths.outDir, function (err) {
        if (err) {
            console.error(err);
            return done(err);
        }
        done();
    });
});

gulp.task('lint', ['prepare'], () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src([
        'app/apy-rest2front/**/*.js',
        'app/apy-rest2front/**/**/*.js',
        'app/apy-rest2front/**/**/**/*.js',
        'app/apy-rest2front/**/**/**/**/*.js'])
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(gp_eslint())
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(gp_eslint.format())
        .pipe(gp_eslint.format('json', fs.createWriteStream(config.paths.outDir + '/lint-report.json')))
        // To have the process exit with an error code (1) on
        // lint error, return the stream and pipe to failAfterError last.
        .pipe(gp_eslint.failAfterError());
});

/**
 * Run test once and exit
 * by running a command in a shell
 * to fix little hang when the Server resource
 * is asked to end (speedup execution).
 *
 * Format global output, adding average info
 * Writing output results to JSON file
 */
gulp.task('test', ['lint'], (done) => {
    // run Karma
    exec('./node_modules/karma/bin/karma start karma.conf.js --single-run', (error, stdout, stderr) => {
        if (error) {
            console.error(`Execution Error: ${error}`);
            return done(error);
        }
        if(stderr)  {
            console.log(`Test Error(s): ${stderr}`);
            return done(error);
        }
        function getResultAsFloat(str) {
            try {
                var pass = str.split('/')[0];
                var total = str.split('/')[1];
            } catch(err) {
                console.log(`Error: ${err}`);
                return 0.0;
            }
            return (parseFloat(pass) / parseFloat(total) * 100)
        }
        function getAvgResult(lines, branches, functions, statements) {
            return (
                    (lines || 0.0) +
                    (branches || 0.0) +
                    (functions || 0.0) +
                    (statements || 0.0)
                ) / 4
        }
        var decimals = 2;
        var out = `${stdout}`;
        var re = /(\d+\/\d+)/g;
        var statements = getResultAsFloat(re.exec(out) + '');
        var branches = getResultAsFloat(re.exec(out) + '');
        var functions = getResultAsFloat(re.exec(out) + '');
        var lines = getResultAsFloat(re.exec(out) + '');
        var testResultsFile = config.paths.outDir + '/coverage/report.json';
        var testResults = {
            lines: lines.toFixed(decimals),
            branches: branches.toFixed(decimals),
            functions: functions.toFixed(decimals),
            statements: statements.toFixed(decimals),
            average: getAvgResult(lines, branches, functions, statements).toFixed(decimals),
            thresholdAverage: getAvgResult(karmaThreshold.lines, karmaThreshold.branches,
                karmaThreshold.functions, karmaThreshold.statements).toFixed(decimals)
        };
        fs.writeFile(testResultsFile, JSON.stringify(testResults, null, 4), function (err) {
            if (err) {
                console.log(`Error while writing file "${testResultsFile}" with errors, ${err}`);
                return done(err);
            }
        });
        var output = `${stdout}`.replace(`================================================================================`, '');
        output = output.slice(0, -1);
        output += `Average      : ${testResults.average}% `;
        output += `( (${testResults.lines}+${testResults.branches}+${testResults.functions}+${testResults.statements})/4 ) `;
        output += `Threshold : ${testResults.thresholdAverage}%\n`;
        output += `===============================================================================`;
        console.log(output);
        return done();
    });
});

gulp.task('doc', (done) => {
    gulp.src([
        'README.md',
        'app/apy-rest2front/**/*.js',
        'app/apy-rest2front/**/**/*.js',
        'app/apy-rest2front/**/**/**/*.js',
        'app/apy-rest2front/**/**/**/**/*.js'
    ], {read: false})
        .pipe(gp_jsdoc3({
            "tags": {
                "allowUnknownTags": true
            },
            "source": {
                "excludePattern": "(^|\\/|\\\\)_"
            },
            "recurse": true,
            "opts": {
                "template": "./node_modules/jsdoc-rst-template/template/",
                "destination": config.paths.outDir + '/docs'
            },
            "plugins": [
                "plugins/markdown"
            ],
            "templates": {
                "cleverLinks": false,
                "monospaceLinks": false,
                "default": {
                    "layoutFile": "./node_modules/jsdoc-rst-template/template/",
                    "outputSourceFiles": true
                },
                "path": "ink-docstrap",
                "theme": "cerulean",
                "navType": "vertical",
                "linenums": true,
                "dateFormat": "MMMM Do YYYY, h:mm:ss a"
            }
        }, done));
});


// Grouping task units
gulp.task('copy', ['copy-fonts', 'copy-icons'], () => {});
gulp.task('minify', ['minify-css', 'minify-js', 'minify-html'], () => {});
gulp.task('build', ['clean', 'test', 'minify', 'copy', 'doc'], () => {});
// Default task
gulp.task('default', ['build'], () => {});