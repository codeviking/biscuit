var cp = require('child_process');
var q = require('q');
var util = require('util');
var path = require('path');
var fs = require('fs');

var DEFAULT_PORT = 4040;

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

// TODO: Expand status messages to include source path being served.
module.exports = {
  start: function(src, port) {
    var started = q.defer();
    var pid = getExistingServerPid(src);
    if(!pid || !isRunning(pid)) {
      // TODO: Currently we simply spawn the process and check that it appears
      // to have started.  We should actually figure out whether the server
      // successfully started.
      // TODO: Listen for 'close' event and remove pid file?
      var p = cp.spawn(
        path.resolve(__dirname, 'oven.js'),
        [
          src,
          typeof port === 'undefined' ? DEFAULT_PORT : port,
        ],
        {
          detached: true,
          stdio: [ 'ignore', process.stdout, process.stderr ]
        }
      );
      p.unref();
      fs.writeFileSync(getPidFilePath(src), p.pid);
      var c = 0;
      var max = 25;
      var intervalCheckIsRunning = setInterval(function() {
        if(isRunning(p.pid) || ++c === max) {
          clearInterval(intervalCheckIsRunning);
          if(c !== max) {
            started.resolve();
          } else {
            started.reject('Unknown issue attempting to start server.');
          }
        }
      }, 50);
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
      var c = 0;
      var max = 25;
      var intervalCheckIsNotRunning = setInterval(function() {
        if(!isRunning(pid) || ++c === max) {
          clearInterval(intervalCheckIsNotRunning);
          if(c !== max) {
            stopped.resolve('Server stopped.');
          } else {
            stopped.reject('Unknown issue attempting to stop server.');
          }
        }
      }, 50);
    } else {
      stopped.reject('Server isn\'t running');
    }
    return stopped.promise;
  }
};
