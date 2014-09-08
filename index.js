var fs = require('fs');
var util = require('util');
var q = require('q');
var ncp = require('ncp');
var server = require('./server');

var Paths = {
  SCAFFOLD : __dirname + '/scaffold'
};
Object.freeze(Paths);

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
  generate: function(dest) {
    var generated = q.defer();

    if(!dest || !fs.statSync(dest).isDirectory()) {
      dest = process.cwd();
    }

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

  serve: function(src) {
    return server.start(src);
  }
}
