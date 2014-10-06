var Flapjack = require('./flapjack');
var Skillet = require('./skillet');
var chef = require('./chef');

const DEFAULT_PORT = 4000;

module.exports = {
  /**
   * Generates a new project in the provided location from the specified recipe.
   *
   * @example
   * flapjack generate allenai/angular-web.recipe
   *
   * @example
   * flapjack generate https://github.com/allenai/angular-web.recipe/archive/master.zip
   *
   * @param   {string} url      The url on to a zip archive where the "recipe" is defined.
   *                            If the url doesn't being with http:// or https:// then
   *                            it will be presumed to be a github url.  In this case
   *                            /archive/master.zip will be appended to the end of the url
   *                            if not present.
   * @param   {string} [dest=.] The directory where the project should be generated. Defaults
   *                            to the current directory if not specified.
   *
   * @returns {object}  A deferred promise which is resolved once generation is complete.
   */
  generate: function(url, dest) {
    return chef.generate(url, dest);
  },
  /**
   * Executes the gulp-build for the flapjack project at the specified
   * path.
   *
   * @param {string} [src.] The path to the project. Defaults to the current working directory.
   *
   * @returns {object} A deferred promise which is resolved once the build is complete.
   */
  build: function(src) {
    return new Flapjack(src || process.cwd()).build();
  },
  /**
   * Starts a new Flapjack HTTP server attached to the specified directory
   * and listening on the specified port.
   *
   * @params  {string}  [src='.'] Path to the flapjack source code. Defaults to the current
   *                              working directory if not specified.
   * @params  {number}  [port=80] The port to listen on.
   *
   * @returns {object}  A deferred promise which is resolved once the server is running.
   */
  startServer: function(src, port) {
    var o = new Skillet(new Flapjack(src || process.cwd()));
    return o.start(port || DEFAULT_PORT);
  },
  /**
   * Stops the Flapjack HTTP server attached to the specified directory.
   *
   * @param   {string}  [src='.'] Path to the flapjack source code.  Defaults to the current
   *                            working directory if not specified.
   *
   * @returns {object}  A deferred promise which is resolved once the server is stopped.
   */
  stopServer: function(src) {
    var s = new Skillet(new Flapjack(src || process.cwd()));
    return s.stop();
  },
  /**
   * Restarts a Flapjack HTTP server attached to the specified directory.
   *
   * @params  {string}   [src='.'] Path to the flapjack source code. Defaults to the current
   *                              working directory if not specified.
   * @params  {number}   [port=80] The port to listen on.
   *
   * @returns {object}   A deferred promise which is resolved once the server is restarted.
   */
  restartServer: function(src, port) {
    var s = new Skillet(new Flapjack(src || process.cwd()));
    return s.stop().then(
      function(msg) {
        console.log(msg);
        s.start(port || DEFAULT_PORT);
      }
    );
  }
};
