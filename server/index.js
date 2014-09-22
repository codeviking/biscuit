var cp = require('child_process');
var q = require('q');
var util = require('util');
var path = require('path');
var fs = require('fs');

var DEFAULT_PORT = 4000;

function isRunning(pid) {
  if(!pid) {
    throw 'You must specify a pid';
  }
  try {
    // Signal 0 doesn't kill the process, it actually just tests for it's
    // existence.  If the proc we're trying to signal doesn't exist it'll
    // throw an exception.
    return process.kill(pid, 0);
  } catch(e) {
    return e.code === 'EPERM';
  }
}

function getPidFilePath(src) {
  return path.resolve(src, '../var/oven.pid');
}

function getExistingServerPid(src) {
  var pid;
  var pidFile = getPidFilePath(src);
  if(fs.existsSync(pidFile)) {
    pid = fs.readFileSync(pidFile).toString();
  }
  return pid;
}

module.exports = {
  start: function(src, port) {
    var started = q.defer();
    var pid = getExistingServerPid(src);
    if(!pid || !isRunning(pid)) {
      var p = cp.fork(
        path.resolve(__dirname, 'oven.js'),
        [
          src,
          typeof port === 'undefined' ? DEFAULT_PORT : port,
        ]
      );
      // Wait for the SERVER_STARTED message from the child process, which
      // indicates the server is up and running.
      // TODO: Should we have a timeout if this isn't ever received?
      p.on('message', function(m) {
        if(m === 'SERVER_STARTED') {
          started.resolve();
        }
      });
      p.on('close', function(code, signal) {
        fs.unlinkSync(getPidFilePath(src));
        started.reject(code, signal);
      });
      fs.writeFileSync(getPidFilePath(src), p.pid);
    } else {
      started.reject(util.format('Server is already running with pid: %s', pid));
    }
    return started.promise;
  },
  stop: function(src) {
    var stopped = q.defer();
    var pid = getExistingServerPid(src);
    if(pid && isRunning(pid)) {
      try {
        process.kill(pid, 'SIGTERM');
      } catch(e) {
        stopped.reject(e);
      }
      fs.unlinkSync(getPidFilePath(src));
      stopped.resolve('Server stopped.');
    } else {
      stopped.reject('Server isn\'t running');
    }
    return stopped.promise;
  }
};
