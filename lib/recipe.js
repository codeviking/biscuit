var fs = require('fs');
var util = require('util');

var PATTERN_ABS_URL = /^https?:\/\//i;
var PATTERN_GITHUB_ARCHIVE = /^https?:\/\/(?:www.)?github.com\/.+?\/archive\/[^\/]+?.zip/i;
var GITHUB_HOST = 'https://github.com';
var GITHUB_ARCHIVE = 'archive/master.zip';

/**
 * Convert the specified url to the appropriate github archive url.
 *
 * @returns {string} The github archive url.
 */
function toGithubAchiveURL(url) {
  var u = [ GITHUB_HOST , url ].join(url.substr(0, 1) !== '/' ? '/' : '');
  var len = u.length;
  if(u.substr(len - GITHUB_ARCHIVE.length) !== GITHUB_ARCHIVE) {
    u = [ u, GITHUB_ARCHIVE ].join(u.substr(len - 1) !== '/' ? '/' : '');
  }
  return u;
}

/**
 * @constructs
 * @class
 *
 * Container for a Flapjack recipe.
 *
 * @param {string} url                  The url to the recipe.
 * @param {string} [dir=process.cwd()]  The target directory where the flapjack should be initialized.
 *                                      Defaults to the current working directory.
 */
var Flapjack = function(url, dir) {
  // Validate the directory
  if(typeof dir !== 'string' || !dir) {
    dir = process.cwd();
  }
  if(!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
  }
  if(!fs.statSync(dir).isDirectory()) {
    throw util.format('Invalid target, "%s" is not a directory', dir);
  }
  this.dir = dir;

  // Validate the url
  if(typeof url !== 'string' || !(url = url.trim())) {
    throw util.format('Invalid url "%s"', url);
  }
  // If it appears to be a relative url, convert it into a github archive url.
  if(!PATTERN_ABS_URL.test(url)) {
    url = toGithubAchiveURL(url);
  }
  this.url = url;
};

/**
 * Returns whether the Flapjack url points to a Github archive.
 *
 * @returns {boolean} True if the url points to a Github archive, false if not.
 */
Flapjack.prototype.isGithubArchive = function() {
  return PATTERN_GITHUB_ARCHIVE.test(this.url);
};

module.exports = Flapjack;