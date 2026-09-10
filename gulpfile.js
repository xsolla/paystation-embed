var fs = require('fs');
var path = require('path');
var gulp = require('gulp');
var gutil = require('gulp-util');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var sourcemaps = require('gulp-sourcemaps');
var source = require('vinyl-source-stream');
var buffer = require('vinyl-buffer');
var browserSync = require('browser-sync');
var browserify = require('browserify');
var sassify = require('sassify');
var stringify = require('stringify');
var watchify = require('watchify');
var gulpif = require('gulp-if');

var pkg = require('./package.json');
var versionFile = path.join(__dirname, 'src', 'version.js');

function writeVersionFile() {
    var contents = 'module.exports = \'' + pkg.version + '\';\n';

    // rewriting with identical contents would needlessly re-trigger watchify
    if (fs.existsSync(versionFile) && fs.readFileSync(versionFile, 'utf8') === contents) {
        return;
    }

    fs.writeFileSync(versionFile, contents);
    gutil.log('Version', gutil.colors.cyan(pkg.version), '->', 'src/version.js');
}

function setupBrowserify(watch) {
    var bundleOptions = {
        cache: {},
        packageCache: {},
        paths: ['./src'],
        standalone: 'XPayStationWidget',
        fullPaths: false,
        debug: true
    };
    var bundler = browserify('./src/main.js', bundleOptions);
    bundler.require('./src/main.js', {entry: true, expose: 'main'});
    bundler.transform({
        outputStyle: 'compressed',
        base64Encode: false,
        'auto-inject': true
    }, sassify);

    bundler.transform(stringify({
        extensions: ['.svg'],
        minify: true,
        minifier: {
            extensions: ['.svg'],
            options: {
                removeComments: true,
                removeCommentsFromCDATA: true,
                removeCDATASectionsFromCDATA: true,
                collapseWhitespace: true
            }
        }
    }));

    if (watch) {
        bundler = watchify(bundler);
        bundler.on('update', function () {  // on any dep update, runs the bundler
            runBundle(bundler, watch);
        });
    }

    runBundle(bundler, watch);
}

function runBundle(bundler, watch) {
    return bundler.bundle()
        // log errors if they happen
        .on('error', gutil.log.bind(gutil, 'Browserify Error'))
        .pipe(source('widget.js'))
        .pipe(gulp.dest('./dist'))
        .pipe(buffer())
        .pipe(rename('widget.min.js'))
        .pipe(sourcemaps.init({loadMaps: true})) // loads map from browserify file
        .pipe(uglify())
        .pipe(sourcemaps.write('./', {includeContent: true, sourceRoot: '.', debug: false})) // writes .map file
        .pipe(gulp.dest('./dist'))
        .pipe(gulpif(watch, browserSync.reload({stream: true, once: true})));
}

gulp.task('version', writeVersionFile);

gulp.task('build', ['version'], function () {
    setupBrowserify(false);
});

gulp.task('browser-sync', function () {
    browserSync({
        startPath: '/index.html',
        server: {
            baseDir: ['example', 'dist']
        },
        port: 3100,
        ghostMode: false
    });
});

gulp.task('serve', ['version', 'browser-sync'], function () {
    setupBrowserify(true);

    gulp.watch(['example/*.html', 'dist/*.js']).on('change', browserSync.reload); //all the other files are managed by watchify
});
