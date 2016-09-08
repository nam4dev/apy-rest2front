var fs = require('fs');
var gulp = require('gulp');
var gp_if = require('gulp-if');
var mkdirp = require('mkdirp');
var gp_util = require('gulp-util');
var gp_clean = require('gulp-clean');
var gp_jsdoc3 = require('gulp-jsdoc3');
var gp_concat = require('gulp-concat');
var gp_rename = require('gulp-rename');
var gp_uglify = require('gulp-uglify');
var gp_eslint = require('gulp-eslint');
var gp_cssnano = require('gulp-cssnano');
var exec = require('child_process').exec;
var gp_sourcemaps = require('gulp-sourcemaps');
var gp_htmlmin = require('gulp-html-minifier');
var apy_config = require('./apy.conf');
var gp_config = apy_config.gulp;
var karma_config = apy_config.gulp.karma;
var karma_threshold = karma_config.thresholdReporter;

gulp.task('clean', () => {
    return gulp.src(gp_config.paths.dev.files.src, {read: false})
        .pipe(gp_if(!gp_config.dev, gp_clean()));
});

gulp.task('minify-css', () => {
    return gulp.src(gp_config.paths.css.files.src)
        .pipe(gp_if(gp_config.dev, gp_sourcemaps.init()))
        .pipe(gp_concat(gp_config.paths.css.minified))
        .pipe(gp_cssnano(gp_config.minifyCSSOpts))
        .pipe(gp_if(gp_config.dev, gp_sourcemaps.write(gp_config.paths.cwd)))
        .pipe(gulp.dest(gp_config.paths.css.dest));
});

gulp.task('minify-js', () => {
    return gulp.src(gp_config.paths.js.files.src)
        .pipe(gp_if(gp_config.dev, gp_sourcemaps.init()))
        .pipe(gp_concat(gp_config.paths.js.minified))
        .pipe(gp_uglify(gp_config.minifyJSOpts))
        .pipe(gp_if(gp_config.dev, gp_sourcemaps.write(gp_config.paths.cwd)))
        .pipe(gulp.dest(gp_config.paths.js.dest));
});

gulp.task('minify-html', () => {
    return gulp.src(gp_config.paths.html.files.src)
        .pipe(gp_htmlmin(gp_config.minifyHTMLOpts))
        .pipe(gp_rename(function (path) {
            if(path.basename === 'index4build') {
                path.basename = "index";
            }
        }))
        .pipe(gulp.dest(gp_config.paths.appDir));
});

gulp.task('copy-fonts', () => {
    return gulp.src(gp_config.paths.fonts.files.src)
        .pipe(gulp.dest(gp_config.paths.fonts.dest));
});

gulp.task('copy-icons', () => {
    return gulp.src(gp_config.paths.icons.files.src)
        .pipe(gulp.dest(gp_config.paths.appDir));
});

gulp.task('prepare', (done) => {
    mkdirp(gp_config.paths.outDir, function (err) {
        if (err) {
            console.error(err);
            return done(err);
        }
        done();
    });
});

gulp.task('copy-doc-design', () => {
    return gulp.src(gp_config.paths.doc.files.design.src)
        .pipe(gulp.dest(gp_config.paths.doc.files.design.dest));
});

gulp.task('copy-doc', ['copy-doc-design'], () => {});

gulp.task('lint', ['prepare'], () => {
    // ESLint ignores files with "node_modules" paths.
    // So, it's best to have gulp ignore the directory as well.
    // Also, Be sure to return the stream from the task;
    // Otherwise, the task may end before the stream has finished.
    return gulp.src(gp_config.paths.eslint.src)
        // eslint() attaches the lint output to the "eslint" property
        // of the file object so it can be used by other modules.
        .pipe(gp_eslint({ fix: true }))
        // eslint.format() outputs the lint results to the console.
        // Alternatively use eslint.formatEach() (see Docs).
        .pipe(gp_eslint.format())
        .pipe(gp_eslint.format('json', fs.createWriteStream(gp_config.paths.eslint.report)))
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
        function getResultAsFloat(str) {
            var pass;
            var total;
            try {
                pass = str.split('/')[0];
                total = str.split('/')[1];
            } catch(err) {
                console.log(`Error: ${err}`);
                return 0.0;
            }
            return (parseFloat(pass) / parseFloat(total) * 100);
        }
        function getAvgResult(lines, branches, functions, statements) {
            return (
                    (lines || 0.0) +
                    (branches || 0.0) +
                    (functions || 0.0) +
                    (statements || 0.0)
                ) / 4;
        }
        var decimals = 2;
        var out = `${stdout}`;
        var re = /(\d+\/\d+)/g;
        var statements = getResultAsFloat(re.exec(out) + '');
        var branches = getResultAsFloat(re.exec(out) + '');
        var functions = getResultAsFloat(re.exec(out) + '');
        var lines = getResultAsFloat(re.exec(out) + '');
        var testResultsFile = gp_config.paths.coverage.report;
        var testResults = {
            lines: lines.toFixed(decimals),
            branches: branches.toFixed(decimals),
            functions: functions.toFixed(decimals),
            statements: statements.toFixed(decimals),
            average: getAvgResult(lines, branches, functions, statements).toFixed(decimals),
            thresholdAverage: getAvgResult(karma_threshold.lines, karma_threshold.branches,
                karma_threshold.functions, karma_threshold.statements).toFixed(decimals)
        };
        fs.writeFile(testResultsFile, JSON.stringify(testResults, null, 4), function (err) {
            if (err) {
                console.log(`Error while writing file "${testResultsFile}" with errors, ${err}`);
                return done(err);
            }
        });
        var completeStdout = `${stdout}`.replace(
            `\n================================================================================`,
            function injectAverage(){
                var output = '\n';
                output += `Average      : ${testResults.average}% `;
                output += `( (${testResults.lines}+${testResults.branches}+${testResults.functions}+${testResults.statements})/4 ) `;
                output += `Threshold : ${testResults.thresholdAverage}%\n`;
                output += `===============================================================================`;
                return output;
            }
        );
        console.log(completeStdout);
        return done(error, stdout, stderr);
    });
});

gulp.task('doc', ['copy-doc'], () => {
    return gulp.src(gp_config.paths.doc.src, {read: false})
        .pipe(gp_jsdoc3(gp_config.jsdoc3));
});

//var es = require('event-stream');
//var path = require('path');
//var documentation = require('gulp-documentation');
//
//var walk = function(dir) {
//    var results = [];
//    var list = fs.readdirSync(dir);
//    list.forEach(function(file) {
//        file = dir + '/' + file;
//        var stat = fs.statSync(file);
//        if (stat && stat.isDirectory()) {
//            results = results.concat(walk(file));
//        }
//        else {
//            results.push(file);
//        }
//    });
//    return results
//};

//gulp.task('docs', function () {
//    var files = walk('app/apy-rest2front/');
//    var tasks = [];
//    files.forEach(function (file) {
//        var basename = path.basename(file);
//        var parts = basename.split('.');
//        var ext = parts.pop();
//        if(ext === 'js') {
//            var filename = parts.join('') + '.md';
//            console.log('filename', filename);
//            tasks.push(gulp.src(file)
//                .pipe(documentation({
//                    format: 'md',
//                    filename: filename
//                })).pipe(gulp.dest("build/api")))
//        }
//
//    });
//    return es.merge(tasks);
//});


// Grouping task units
gulp.task('copy', ['copy-fonts', 'copy-icons'], () => {});
gulp.task('minify', ['minify-css', 'minify-js', 'minify-html'], () => {});
gulp.task('build', ['clean', 'test', 'minify', 'copy', 'doc'], () => {});
// Default task
gulp.task('default', ['build'], () => {});