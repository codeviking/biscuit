var fs = require('fs');
var util = require('util');
var q = require('q');
var ncp = require('ncp');

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
    var deferred = q.defer();

    if(!dest || !fs.statSync(dest).isDirectory()) {
      dest = process.cwd();
    }

    // TODO: option to enable "clobbering", or selective "clobbering" (ie, update
    // to the latest styles and JS, but don't clobber the application HTML file,
    // etc...)
    ncp(Paths.SCAFFOLD, dest, { filter: '.git', clobber: false }, function(err) {
      if(err) {
        console.log(err);
        deferred.reject(err);
      } else {
        deferred.resolve();
      }
    });

    return deferred.promise;
  }
}
