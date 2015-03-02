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

var bundleOptions = watchify.args;
bundleOptions.paths = ['./src'];
bundleOptions.standalone = 'XPayStationWidget';
bundleOptions.fullPaths = false;
bundleOptions.debug = true;

var bundler = watchify(browserify('./src/main.js', bundleOptions));
bundler.require('./src/main.js', {entry: true, expose: 'main'});
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

bundler.on('update', bundle); // on any dep update, runs the bundler

function bundle() {
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
        .pipe(browserSync.reload({stream: true, once: true}))
        .pipe(gulp.dest('./dist'));
}

gulp.task('scripts', function () {
    return bundle();
});

gulp.task('browser-sync', ['scripts'], function() {
    browserSync({
        startPath: '/index.html',
        server: {
            baseDir: ['example', 'dist']
        },
        port: 3100,
        ghostMode: false
    });
});

gulp.task('serve', ['browser-sync'], function () {
    gulp.watch(['example/*.html', 'src/*.js', 'src/*.svg', 'src/*.scss'], ['scripts']);
});
