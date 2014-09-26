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
  // TODO: need to handle exceptions in oven and report them
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
      fs.writeFileSync(getPidFilePath(src), p.pid);

      // Wait for the SERVER_STARTED message from the child process, which
      // indicates the server is up and running.
      p.on('message', function(m) {
        if(m === 'SERVER_STARTED') {
          started.resolve();
        }
      });

      p.on('error', function(err) {
        fs.unlinkSync(getPidFilePath(src));
        started.reject(
            util.format(
              'Error encountered while attempting to start Server : %s',
              err
            )
          );
      });

      p.on('close', function(code, signal) {
        fs.unlinkSync(getPidFilePath(src));
        started.reject(
            util.format(
              'Server unexpectantly shut down. Code: %s, Signal: %s',
              code,
              signal
            )
          );
      });
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
