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

    console.log(util.format('Generating new project in %s...', dest));

    if(!dest || !fs.statSync(dest).isDirectory()) {
      dest = process.cwd();
    }

    ncp(Paths.SCAFFOLD, dest, { filter: '.git' }, function(err) {
      if(err) {
        console.log(err);
        deferred.reject(err);
      } else {
        console.log(util.format('Success! New project created in %s', dest));
        deferred.resolve();
      }
    });

    return deferred.promise;
  }
}
