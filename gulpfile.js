var gulp = require('gulp'),
  gutil   = require('gulp-util'),
  plugins = require('gulp-load-plugins')();

gulp.task('default', ['build']);

gulp.task('build', ['build-js', 'build-css']);

var filePaths = {
  js: ['client/app.js', 'client/modules/**/*.js'],
  css: 'client/assets/css/**/*.css'
}

gulp.task('jslint' , function() {
  return gulp.src(filePaths.js)
    .pipe(plugins.jshint())
    .pipe(plugins.jshint.reporter('jshint-stylish'));
});

gulp.task('build-js', ['jslint'], function() {
  return gulp.src(filePaths.js)
    .pipe(plugins.sourcemaps.init())  // process the original sources
      .pipe(plugins.concat('scripts.min.js'))
      .pipe(gutil.env.type === 'production' ? plugins.ugilify() : gutil.noop())
    .pipe(plugins.sourcemaps.write())  // add the map to modified source
    .pipe(gulp.dest('client'));
});

gulp.task('csslint', function() {
  return gulp.src(filePaths.css)
    .pipe(plugins.csslint())
    .pipe(plugins.csslint.reporter());
});

gulp.task('build-css', ['csslint'], function() {
  return gulp.src(filePaths.css)
    .pipe(plugins.sourcemaps.init())  // process the original sources
      .pipe(plugins.concatCss('main.min.css'))
      .pipe(gutil.env.type === 'production' ? plugins.cssmin() : gutil.noop())
    .pipe(plugins.sourcemaps.write())  // add the map to modified source
    .pipe(gulp.dest('client')).on('error', gutil.log);
});

gulp.task('lint', ['csslint', 'jslint']);

gulp.task('watch', function() {
  gulp.watch(filePaths.js, ['build-js']);
  gulp.watch(filePaths.css, ['build-css']);
});
