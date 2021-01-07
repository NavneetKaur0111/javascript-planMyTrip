const { src, dest, series, parallel, watch } = require('gulp');
const del = require('del');
const csso = require('gulp-csso');
const uglify = require('gulp-uglify');
const concat = require('gulp-concat');
const sourcemaps = require('gulp-sourcemaps');
const browserSync = require('browser-sync').create();
const babel = require('gulp-babel');
const surge = require('gulp-surge');

function watchTask() {
  watch('src/styles/*.css', stylesTask);
  watch('src/*.html', htmlTask);
  watch('src/scripts/*.js', scriptsTask);
}

function serve() {
  browserSync.init({
    watch: true,
    server: {
      baseDir: './dist',
    },
  });
}

function clearTask() {
  return del('dist');
}

function htmlTask() {
  return src('src/*.html')
    .pipe(dest('dist'));
}

function imagesTask() {
  return src('src/images/*')
    .pipe(dest('dist/images'));
}

function stylesTask() {
  return src('src/styles/*.css')
    .pipe(sourcemaps.init())
    .pipe(csso())
    .pipe(sourcemaps.write())
    .pipe(concat('all.css'))
    .pipe(dest('dist/styles'));
}

function scriptsTask() {
  return src('src/scripts/*.js')
    .pipe(sourcemaps.init())
    .pipe(babel({
      presets: ['@babel/env']
    }))
    .pipe(uglify())
    .pipe(sourcemaps.write())
    .pipe(concat('all.js'))
    .pipe(dest('dist/scripts'));
}

function deployTask () {
  return surge({
    project: './dist',
    domain: 'plan-my-trip.surge.sh'
  })
}

exports.watch = watchTask;
exports.clear = clearTask;
exports.html = htmlTask;
exports.images = imagesTask;
exports.styles = stylesTask;
exports.scripts = scriptsTask;
exports.deploy = deployTask;
exports.default = series(
  clearTask,
  parallel(htmlTask, imagesTask, stylesTask, scriptsTask),
  parallel(watchTask, serve)
);