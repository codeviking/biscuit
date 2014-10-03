var fs = require('fs');
var util = require('util');
var q = require('q');
var path = require('path');
var colors = require('colors');
var ncp = require('ncp');
var cp = require('child_process');
var request = require('request');
var DecompressZip = require('decompress-zip');
var rimraf = require('rimraf');

var Biscuit = require('./biscuit');
var Oven = require('./oven');

const DEFAULT_PORT = 80;
const REGEXP_ABS_URL = /^https?:\/\//i;
const GITHUB_HOST = 'https://github.com';
const GITHUB_ARCHIVE = 'archive/master.zip';
const ARTIFACT = path.resolve('artifact');

/**
 * Convert the specified url to the appropriate github archive url.
 *
 * @returns {string} The github archive url.
 */
function githubArchiveUrl(url) {
  if(typeof url !== 'string') {
    throw 'Url must be a string';
  }
  var u = [ GITHUB_HOST , url ].join(url.substr(0, 1) !== '/' ? '/' : '');
  var len = u.length;
  if(u.substr(len - GITHUB_ARCHIVE.length) !== GITHUB_ARCHIVE) {
    u = [ u, GITHUB_ARCHIVE ].join(u.substr(len - 1) !== '/' ? '/' : '');
  }
  return u;
}

module.exports = {
  /**
   * Generates a new project in the provided location from the specified recipe.
   *
   * @example
   * biscuit generate allenai/angular-web.recipe
   *
   * @example
   * biscuit generate https://github.com/allenai/angular-web.recipe/archive/master.zip
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
    var generated = q.defer();

    if(typeof url !== 'string') {
      throw util.format('Invalid recipe url: "%s"', url);
    }

    if(!REGEXP_ABS_URL.test(url)) {
      url = githubArchiveUrl(url);
    }

    if(!dest) {
      dest = process.cwd();
    }

    dest = path.resolve(dest);

    if(!fs.existsSync(dest) || !fs.statSync(dest).isDirectory()) {
      throw util.format('Invalid destination: "%s"', dest);
    }

    var archive = path.resolve(ARTIFACT, Date.now() + '-archive.zip');

    var ws = fs.createWriteStream(archive);

    // TODO:
    // This is callback SOUP
    // Figure out End of Directory Error... (zip archive issue)
    console.log(util.format('Downloading "%s"', url));
    request.get(url, function(err, res, body) {
        if(err || res.statusCode !== 200) {
          fs.unlinkSync(archive);
          if(!err) {
            err = util.format('Invalid recipe url: "%s"', url);
          }
          generated.reject(err || res.statusText);
        } else {
          var unzipper = new DecompressZip(archive);

          unzipper.on('error', function(e) {
            generated.reject(e);
            fs.unlinkSync(archive);
          });

          unzipper.on('extract', function(log) {
            fs.unlinkSync(archive);
            if(log.length > 0) {
              var parent = log.shift();
              if(parent.folder) {
                var from = path.resolve(ARTIFACT, parent.folder);
                console.log('Archive extracted, copying "%s" to "%s"...', from, dest);
                ncp(from, dest, function(err) {
                  rimraf(from, function() {
                    if(err) {
                      generated.reject(err);
                    } else {
                      console.log('Installing dependencies...');
                      cp.spawn('npm', ['install'], { cwd: dest, stdio: 'inherit' })
                        .on('error', function(err) {
                          generated.reject(err);
                        })
                        .on('close', function() {
                          generated.resolve();
                        });
                    }
                  });
                });
              } else {
                generated.reject('Unexpected archive format.');
                rimraf(path.resolve(ARTIFACT, '**', '*'),
                    generated.reject.bind(generated, 'Invalid recipe.'));
              }
            }
          });

          console.log(util.format('Download complete, unarchiving "%s"', archive));
          unzipper.extract({
            path: ARTIFACT
          });
        }
      }).pipe(ws);

    return generated.promise;
  },
  /**
   * Starts a new Biscuit HTTP server attached to the specified directory
   * and listening on the specified port.
   *
   * @params  {string}  [src='.'] Path to the biscuit source code. Defaults to the current
   *                              working directory if not specified.
   * @params  {number}  [port=80] The port to listen on.
   *
   * @returns {object}  A deferred promise which is resolved once the server is running.
   */
  startServer: function(src, port) {
    var o = new Oven(new Biscuit(src || process.cwd()));
    return o.start(port || DEFAULT_PORT);
  },
  /**
   * Stops the Biscuit HTTP server attached to the specified directory.
   *
   * @param   {string}  [src='.'] Path to the biscuit source code.  Defaults to the current
   *                            working directory if not specified.
   *
   * @returns {object}  A deferred promise which is resolved once the server is stopped.
   */
  stopServer: function(src) {
    var o = new Oven(new Biscuit(src || process.cwd()));
    return o.stop();
  },
  /**
   * Restarts a Biscuit HTTP server attached to the specified directory.
   *
   * @params  {string}   [src='.'] Path to the biscuit source code. Defaults to the current
   *                              working directory if not specified.
   * @params  {number}   [port=80] The port to listen on.
   *
   * @returns {object}   A deferred promise which is resolved once the server is restarted.
   */
  restartServer: function(src, port) {
    var o = new Oven(new Biscuit(src || process.cwd()));
    return b.stopServer().then(
      function(msg) {
        console.log(msg);
        b.startServer(port || DEFAULT_PORT);
      }
    );
  }
};
