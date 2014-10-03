var q = require('q');
var fs = require('fs');
var path = require('path');
var util = require('util');
var cp = require('child_process');

function Stove(biscuit) {
  this.biscuit = biscuit;
};

Stove.prototype.pidFile = function() {
  return path.resolve(this.biscuit.paths.var, 'oven.pid');
};

Stove.prototype.pid = function(pid) {
  var file = this.pidFile();
  if(typeof pid !== 'undefined' && !this.isRunning()) {
    fs.writeFileSync(file, pid);
  }
  return fs.existsSync(file) && fs.readFileSync(file).toString();
};

Stove.prototype.removePidFile = function() {
  fs.unlinkSync(this.pidFile());
};

Stove.prototype.isRunning = function() {
  var pid = this.pid();
  if(!pid) {
    return false;
  }
  // Send signal 0 to the pid, which doesn't try to kill it.  Instead, if
  // this fails it'll throw an exception meaning the process doesn't
  // exist.
  try {
    return process.kill(pid, 0);
  } catch(e) {
    return e.code === 'EPERM';
  }
};

Stove.prototype.start = function(port) {
  var started = q.defer();
  if(!this.isRunning()) {
    // Spawn the "oven" (our http server)
    var p = cp.fork(path.resolve(__dirname, 'server.js'),
        [ this.biscuit.base, port ]);

    // Write the pid out to a pid file
    this.pid(p.pid);

    // Wait for the SERVER_STARTED message from the child process, which
    // indicates the server is up and running.
    p.on('message', function(m) {
      if(m === 'SERVER_STARTED') {
        started.resolve();
      }
    });

    // The error event occurs if we're unable to start the process
    // for some reason.
    p.on('error', function(err) {
      this.removePidFile();
      started.reject(util.format(
          'Error encountered while attempting to start Server : %s', err));
    }.bind(this));

    // If the process shutsdown unexpectadly, reject the promise.
    p.on('close', function(code, signal) {
      this.removePidFile();
      started.reject(util.format(
        'Server unexpectantly shut down. Code: %s, Signal: %s', code, signal));
    }.bind(this));
  } else {
    started.reject(util.format('Server is already running with pid: %s', this.pid()));
  }
  return started.promise;
};

Stove.prototype.stop = function() {
  var stopped = q.defer();
  if(this.isRunning()) {
    try {
      process.kill(this.pid(), 'SIGTERM');
    } catch(e) {
      stopped.reject(e);
    }
    this.removePidFile();
    stopped.resolve('Server stopped.');
  } else {
    stopped.reject('Server isn\'t running');
  }
  return stopped.promise;
};


module.exports = Stove;
