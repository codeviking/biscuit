var gulp = require('gulp');
var rimraf = require('gulp-rimraf');
var mocha = require('gulp-mocha');

/**
 * Cleans out the /tmp directory, which is used for testing output.
 */
gulp.task('clean-test', function() {
  gulp.src('tmp/**/*').pipe(rimraf());
});

/**
 * Runs all files ending in _test.js in /tests using the mocha testing
 * suite.
 */
gulp.task('test', [ 'clean-test' ], function() {
  gulp.src('tests/*-test.js', { read: false })
    .pipe(mocha());
});
