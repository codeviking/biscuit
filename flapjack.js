var fs = require('fs');
var q = require('q');
var util = require('util');
var path = require('path');
var cp = require('child_process');
var futil = require('flapjack-util');
var events = require('events');

function Flapjack(base) {
  if(!base || !fs.existsSync(base) || !fs.statSync(base).isDirectory()) {
    throw util.format('Invalid directory: "%s"', base.magenta);
  }
  this.base = base;
  var pathsPath = path.resolve(this.base, 'paths.js');
  var paths;
  try {
    paths = require(pathsPath);
  } catch(e) {
    throw util.format('Missing paths: "%s"', pathsPath);
  }
  this.paths = new futil.Paths(this.base, paths);

  // If the build and var directories don't exist, create them
  if(!fs.existsSync(this.paths.build)) {
    fs.mkdirSync(this.paths.build);
  }
  if(!fs.existsSync(this.paths.var)) {
    fs.mkdirSync(this.paths.var);
  }

  this.paths.validate();
}

util.inherits(Flapjack, events.EventEmitter);

Flapjack.prototype.status = function() {
  var status = Flapjack.Status.LAST_BUILD_SUCCESSFUL;
  if(this.building && this.building.promise && this.building.promise.isPending()) {
    status = Flapjack.Status.BUILDING;
  } else if(this.error) {
    status = Flapjack.Status.LAST_BUILD_FAILED;
  }
  return status;
};

Flapjack.prototype.build = function() {
  if(this.status() !== Flapjack.Status.BUILDING) {
    this.emit(Flapjack.Event.BUILDING, this);
    this.building = q.defer();
    this.error = undefined;

    this.building.promise.then(
      function() {
        this.emit.apply(this, [ Flapjack.Event.BUILD_SUCCESSFUL ].concat(
            Array.prototype.slice.apply(arguments)));
        return this.building.promise;
      }.bind(this),
      function() {
        this.emit.apply(this, [ Flapjack.Event.BUILD_FAILED ].concat(
            Array.prototype.slice.apply(arguments)));
        return this.building.promise;
      }.bind(this));

    // TODO: refactor to use fork, and use process.send to send error
    // information back to this process in a non-chunked form.
    var g = cp.spawn('gulp', [ '--flapjack' ], { cwd: this.base });

    var error = '';
    g.stderr.on('data', function(d) {
      error += d;
    });

    g.on('error', function(e) {
      this.building.reject(
        new futil.GulpTaskError({
          task: 'gulp',
          message: 'Error Executing Gulp Build',
          extra: e
        })
      );
    }.bind(this));

    g.on('close', function() {
      if(error) {
        try {
          error = new futil.GulpTaskError(JSON.parse(error));
        } catch(e) {}
        this.error = error;
        this.building.reject(error);
      } else {
        this.building.resolve();
      }
    }.bind(this));
  }
  return this.building.promise;
};

Flapjack.Event = {
  BUILDING: 'building',
  BUILD_SUCCESSFUL: 'build-successful',
  BUILD_FAILED: 'build-failed'
};
Object.freeze(Flapjack.Event);

Flapjack.Status = {
  BUILDING: 'building',
  LAST_BUILD_SUCCESSFUL: 'last-build-successful',
  LAST_BUILD_FAILED: 'last-build-failed'
};
Object.freeze(Flapjack.Status);

module.exports = Flapjack;
