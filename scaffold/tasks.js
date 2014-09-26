var gulp = require('gulp');
var plumber = require('gulp-plumber');
var cachebreaker = require('gulp-cache-breaker');
var autoprefixer = require('gulp-autoprefixer');
var less = require('gulp-less');
var rimraf = require('gulp-rimraf');
var gutil = require('gulp-util');
var butil = require('biscuit-util');
var minimist = require('minimist');

gulp.task('clean', function() {
  return gulp.src('build/*')
      .pipe(rimraf());
});

gulp.task('html', function() {
  return gulp.src('src/**/*.html')
      .pipe(cachebreaker('build/'))
      .pipe(gulp.dest('build/'));
});

gulp.task('less', function() {
  return gulp.src('src/styles.less')
    .pipe(plumber(function(err) {
      if(minimist(process.argv).baking) {
        console.error(
          JSON.stringify(
            new butil.GulpTaskError(
              'less',
              err.message,
              err.filename,
              err.line,
              err.extract
            )
          )
        );
      } else {
        gutil.log(err.toString());
      }
    }))
    .pipe(less({ compress: true }))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest('build/'));
});
