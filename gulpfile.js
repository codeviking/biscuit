var gulp = require('gulp');
var mocha = require('gulp-mocha');

gulp.task('test', function() {
  gulp.src('tests/*_test.js', { read: false })
    .pipe(mocha());
});