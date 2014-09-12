var fs = require('fs');
var q = require('q');
var util = require('util');
var path = require('path');
var rimraf = require('rimraf');
var gulp = require('gulp');
var plumber = require('gulp-plumber');
var cachebreaker = require('gulp-cache-breaker');
var autoprefixer = require('gulp-autoprefixer');
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
  // TODO: should this be stream instead of promise based?
  return this.clean(dir)
      .then(this.less.bind(this, dir))
      .then(this.html.bind(this, dir));
};

Biscuit.prototype.clean = function(dir) {
  var cleaned = q.defer();
  // TODO: should we use gulp-rimraf instead?
  rimraf(path.resolve(dir, '*'), function(err) {
    if(err) {
      cleaned.reject();
    } else {
      cleaned.resolve();
    }
  });
  return cleaned.promise;
};

Biscuit.prototype.html = function(dir) {
  var copied = q.defer();
  gulp.src(path.resolve(this.src , '**/*.html'))
    .pipe(plumber(copied.reject))
    .pipe(cachebreaker(dir))
    .pipe(gulp.dest(dir))
    .on('end', copied.resolve);
  return copied.promise;
};

Biscuit.prototype.less = function(dir) {
  var compiled = q.defer();
  // TODO: put in autoprefixer
  gulp.src(path.resolve(this.src, 'styles.less'))
    .pipe(plumber(compiled.reject))
    .pipe(less({ compress: true }))
    .pipe(autoprefixer('last 2 versions'))
    .pipe(gulp.dest(dir))
    .on('end', compiled.resolve);
  return compiled.promise;
};

module.exports = Biscuit;
