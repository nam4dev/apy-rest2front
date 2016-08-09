var gulp = require('gulp');
var gp_if = require('gulp-if');
var gp_clean = require('gulp-clean');
var gp_concat = require('gulp-concat');
var gp_rename = require('gulp-rename');
var gp_uglify = require('gulp-uglify');
var gp_cssnano = require('gulp-cssnano');
var gp_sourcemaps = require('gulp-sourcemaps');
var gp_htmlmin = require('gulp-html-minifier');

var paths = new function () {
    return {
        cwd: '.',
        outDir: 'dist',
        appDir: 'dist/app',
        outJsMin: 'apy-rest2front.min.js',
        outCssMin: 'apy-rest2front.min.css',
        outFonts: '/fonts',
        devFiles: [
            'dist/app/apy-rest2front.min.js.map',
            'dist/app/apy-rest2front.min.css.map'
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
    gulp.src(config.paths.devFiles)
        .pipe(gp_if(!config.dev, gp_clean()))
});

gulp.task('minify-css', () => {
    var stream = gulp.src(config.paths.cssFiles)
        .pipe(gp_if(config.dev, gp_sourcemaps.init()))
        .pipe(gp_concat(config.paths.outCssMin))
        .pipe(gp_cssnano(config.minifyCSSOpts))
        .pipe(gp_if(config.dev, gp_sourcemaps.write(config.paths.cwd)))
        .pipe(gulp.dest(config.paths.appDir))
});

gulp.task('minify-js', () => {
    return gulp.src(config.paths.jsFiles)
        .pipe(gp_if(config.dev, gp_sourcemaps.init()))
        .pipe(gp_concat(config.paths.outJsMin))
        .pipe(gp_uglify(config.minifyJSOpts))
        .pipe(gp_if(config.dev, gp_sourcemaps.write(config.paths.cwd)))
        .pipe(gulp.dest(config.paths.appDir))
});

gulp.task('minify-html', () => {
    return gulp.src(config.paths.htmlFiles)
        .pipe(gp_htmlmin(config.minifyHTMLOpts))
        .pipe(gulp.dest(config.paths.appDir))
});

gulp.task('copy-fonts', () => {
    return gulp.src(config.paths.fontFiles)
        .pipe(gulp.dest(config.paths.outDir + config.paths.outFonts))
});

gulp.task('copy-favicon', () => {
    return gulp.src(config.paths.iconFiles)
        .pipe(gulp.dest(config.paths.appDir))
});

gulp.task('minify', ['minify-css', 'minify-js', 'minify-html'], () => {});
gulp.task('copy', ['copy-fonts', 'copy-favicon'], () => {});
gulp.task('build', ['clean', 'minify', 'copy'], () => {});
gulp.task('default', ['build'], () => {});