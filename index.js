var Flapjack = require('./lib/flapjack');
var Recipe = require('./lib/recipe');

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
    return new Flapjack(new Recipe(url, dest)).cook();
  }
};
