var fs = require('fs');
var util = require('util');
var q = require('q');
var ncp = require('ncp');

var Biscuit = require('./biscuit');

var Paths = {
  SCAFFOLD : __dirname + '/scaffold'
};
Object.freeze(Paths);

var DEFAULT_PORT = 4000;

module.exports = {

  /**
   * Generates a new project in the provided location.
   *
   * @param {string} [dest] Path to the directory where the project should be
   *                        generated.  If not specified defaults to the current
   *                        working directory.
   *
   * @return {undefined}
   */
  generate: function(recipe, dest) {
    var generated = q.defer();

    if(!dest || !fs.statSync(dest).isDirectory()) {
      dest = process.cwd();
    }

    // TODO:
    // Verify recipe
    // Download recipe source
    // Execute test hooks

    // TODO: option to enable "clobbering", or selective "clobbering" (ie, update
    // to the latest styles and JS, but don't clobber the application HTML file,
    // etc...)
    ncp(Paths.SCAFFOLD, dest, { filter: '.git', clobber: false }, function(err) {
      if(err) {
        generated.reject(err);
      } else {
        generated.resolve();
      }
    });

    return generated.promise;
  },

  startServer: function(src, port) {
    return new Biscuit(src || process.cwd()).startServer(port || DEFAULT_PORT);
  },

  stopServer: function(src) {
    return new Biscuit(src || process.cwd()).stopServer();
  },

  restartServer: function(src, port) {
    var b = new Biscuit(src);
    return b.stopServer().then(
      function(msg) {
        console.log(msg);
        b.startServer(port || DEFAULT_PORT);
      }
    );
  }

}
