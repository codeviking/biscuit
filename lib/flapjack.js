var fs = require('fs');
var fstream = require('fstream');
var q = require('q');
var path = require('path');
var util = require('util');
var ncp = require('ncp');
var cp = require('child_process');
var request = require('request');
var unzip = require('unzip');
var del = require('del');
var Recipe = require('./recipe');
var Log = require('log');
var log = new Log('info');

/**
 * @class
 * @constructs
 *
 * Representation of a Project.
 *
 * @param {Recipe} recipe The recipe for the perfect flapjack.
 */
function Flapjack(recipe) {
  if(!(recipe instanceof Recipe)) {
    throw 'Invalid recipe';
  }
  this.recipe = recipe;
}

/**
 * Downloads the flapjack source files.
 *
 * @returns {Promise} A promise which is resolved once the project source files have been downloaded.
 */
Flapjack.prototype.download = function() {
  var downloaded = q.defer();

  var archive = path.resolve(this.recipe.dir, Date.now() + '-archive.zip');
  var ws = fs.createWriteStream(archive);

  log.info('Downloading "%s"', this.recipe.url);
  request.get(this.recipe.url, function(err, res, body) {
      if(err || res.statusCode !== 200) {
        fs.unlinkSync(archive);
        downloaded.reject(err || res.statusText);
      } else {
        log.info('Download complete.');
        downloaded.resolve(archive);
      }
    }).pipe(ws);

  return downloaded.promise;
};

/**
 * Extracts the flapjack source files.
 *
 * @returns {Promise} A promise which is resolved once the files have been extracted.
 */
Flapjack.prototype.extract = function(archive) {
  var extracted = q.defer();
  var ws = fstream.Writer(this.recipe.dir);

  log.info(util.format('Extracting "%s"', archive));
  fs.createReadStream(archive)
    .pipe(unzip.Parse())
    .pipe(ws)
    .on('error', function(e) {
      fs.unlinkSync(archive);
      extracted.reject(e);
    })
    .on('close', function() {
      fs.unlinkSync(archive);
      // Github archives have an extra directory which we need to "unpack"
      if(this.recipe.isGithubArchive()) {
        fs.readdir(this.recipe.dir, function(err, files) {
          if(err || !Array.isArray(files) || files.length === 0) {
            extracted.reject();
          } else if(files.length === 1) {
            var dir = path.resolve(this.recipe.dir, files.pop());
            ncp(dir, this.recipe.dir, function() {
              del(dir, { force: true }, function() {
                log.info('Extraction complete');
                extracted.resolve();
              });
            });
          }
        }.bind(this));
      } else {
        log.info(util.format('Extracted', archive));
        extracted.resolve();
      }
    }.bind(this));

  return extracted.promise;
};

/**
 * Installs the npm dependencies for the project.
 *
 * @returns {Promise} A promise which is resolved once dependencies have been installed.
 */
Flapjack.prototype.installDependencies = function() {
  var installed = q.defer();
  log.info('Installing dependencies');
  var p = cp.spawn('npm', ['install'], { cwd: this.recipe.dir });
  p.stdout.on('data', function(d) {
    log.debug(d);
  });
  p.on('error', function(err) {
      installed.reject(err);
    })
    .on('close', function() {
      log.info('Dependencies installed successfully.');
      installed.resolve(util.format('Your Flapjack is ready: "%s"', this.recipe.dir));
    }.bind(this));
  return installed.promise;
};

/**
 * Whip together the perfect flapjack.
 *
 * @returns {Promise} A promise which is resolved once the Flapjack is ready.
 */
Flapjack.prototype.cook = function() {
  return this.download()
      .then(this.extract.bind(this))
      .then(this.installDependencies.bind(this));
};

module.exports = Flapjack;