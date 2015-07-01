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
var fs = require('fs');
var replaceTask = require('gulp-replace-task');

function setupBrowserify(watch) {
    var bundleOptions = {
        cache: {},
        packageCache: {},
        paths: ['./.tmp'],
        standalone: 'XPayStationWidget',
        fullPaths: false,
        debug: true
    };
    var bundler = browserify('./.tmp/main.js', bundleOptions);
    bundler.require('./.tmp/main.js', {entry: true, expose: 'main'});
    bundler.require('./bower_components/jquery/dist/jquery.js', {expose: 'jquery'});
    bundler.require('./bower_components/lodash/lodash.js', {expose: 'lodash'});
    bundler.transform({
        outputStyle: 'compressed'
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

gulp.task('build', ['version:generate'], function () {
    setupBrowserify(false);
});

gulp.task('serve', ['version:generate'], function () {
    setupBrowserify(true);

    browserSync({
        startPath: '/index.html',
        server: {
            baseDir: ['example', 'dist']
        },
        port: 3100,
        ghostMode: false
    });

    gulp.watch(['example/*.html']).on('change', browserSync.reload);
    gulp.watch(['src/*.js', 'src/*.svg', 'src/*.scss'], ['version:generate']); //watchify will reload browsers
});

var bowerConfig = JSON.parse(fs.readFileSync('bower.json', 'utf-8'));
gulp.task('version:generate', ['copyfiles'], function () {
    return gulp.src(['./src/version.js'])
        .pipe(replaceTask({
            patterns: [
                {
                    json: {
                        version: bowerConfig.version
                    }
                }
            ]
        }))
        .pipe(gulp.dest('.tmp/'));
});

gulp.task('copyfiles', function() {
    return gulp.src(['src/*', 'src/**/*'])
        .pipe(gulp.dest('.tmp/'))
});