var fs = require('fs');
var q = require('q');
var util = require('util');
var path = require('path');
var rimraf = require('rimraf');
var cp = require('child_process');
var butil = require('biscuit-util');

function Biscuit(src) {
  if(!src || !fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
    throw util.format('Invalid source directory: %s', src);
  }
  this.src = src;
};

Biscuit.prototype.bake = function() {
  var baked = q.defer();
  var dir = path.resolve(this.src, '../build');

  if(!fs.existsSync(dir) || !fs.statSync(dir).isDirectory()) {
    fs.mkdirSync(dir);
  }

  var g = cp.spawn('gulp', [ '--baking' ], { cwd: dir, });

  var err = '';
  g.stderr.on('data', function(d) {
    err += d;
  });

  // TODO: convert to standardized error format (and figure out how to
  // actually trigger this)
  g.on('error', function(e) {
    baked.reject(e);
  });

  g.on('close', function() {
    if(err) {
      try {
        err = new butil.GulpTaskError(JSON.parse(err));
      } catch(e) {}
      baked.reject(err);
    } else {
      baked.resolve()
    }
  });

  return baked.promise;
};

module.exports = Biscuit;
