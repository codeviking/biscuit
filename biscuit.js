var fs = require('fs');
var q = require('q');
var util = require('util');
var path = require('path');
var rimraf = require('rimraf');
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var less = require('gulp-less');

function Biscuit(src) {
  if(!src || !fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
    throw util.format('Invalid source directory: %s', src);
  }
  this.src = src;
};

Biscuit.prototype.bake = function(dir) {
  if(!dir) {
    dir = path.resolve(this.src, '../build');
  }
  if(!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    fs.mkdirSync(dir);
  }
  this.clean(dir);
  return q.all(
    this.html(dir),
    this.less(dir)
  );
};

Biscuit.prototype.clean = function(dir) {
  rimraf.sync(path.resolve(dir, '*'));
  return this;
};

Biscuit.prototype.html = function(dir) {
  var copied = q.defer();
  gulp.src(path.resolve(this.src , '**/*.html'))
    .pipe(plumber(copied.reject))
    .pipe(gulp.dest(dir))
    .on('end', copied.resolve);
  return copied;
};

Biscuit.prototype.less = function(dir) {
  var compiled = q.defer();
  // TODO: put in autoprefixer
  gulp.src(path.resolve(this.src, 'styles.less'))
    .pipe(plumber(compiled.reject))
    .pipe(less({ compress: true }))
    .pipe(gulp.dest(dir))
    .on('end', compiled.resolve);
  return compiled;
};

module.exports = Biscuit;
