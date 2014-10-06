var fs = require('fs');
var q = require('q');
var path = require('path');
var util = require('util');
var ncp = require('ncp');
var cp = require('child_process');
var colors = require('colors');
var request = require('request');
var DecompressZip = require('decompress-zip');
var rimraf = require('rimraf');

const REGEXP_ABS_URL = /^https?:\/\//i;
const GITHUB_HOST = 'https://github.com';
const GITHUB_ARCHIVE = 'archive/master.zip';
// TODO: Figure out if there's a way to derive the system specific appropriate
// equivalent of /tmp.
const TMP_DIR = '/tmp';

/**
 * Move the specified directory from one location to another.
 *
 * @param {string} from The directory to move.
 * @param {string} to The path to move it to.
 *
 * @returns {object} A promise which is resolved once the directory is moved.
 */
function move(from, to) {
  var copied = q.defer();

  console.log('Copying "%s" to "%s"...', from, to);
  ncp(from, to, function(err) {
    rimraf(from, function(e) {
      if(e) {
        console.warn('Failed to cleanup "%s"', from);
      }
      if(err) {
        copied.reject(err);
      } else {
        console.log('Copy complete.');
        copied.resolve(to);
      }
    });
  });

  return copied.promise;
}

/**
 * Installs the dependencies present in the specified path by executing
 * npm install.
 *
 * @param {string} src The path to the directory containing the package.json
 *
 * @returns {object} A deferred promise which is resolved once the project's dependencies
 *                   have been installed.
 */
function installDependencies(src) {
  var installed = q.defer();

  console.log('Installing dependencies...');
  cp.spawn('npm', ['install'], { cwd: src, stdio: 'inherit' })
    .on('error', function(err) {
      installed.reject(err);
    })
    .on('close', function() {
      console.log('Dependencies installed successfully.');
      installed.resolve();
    });

  return installed.promise;
}

/**
 * Extracts the specified zip archive.
 *
 * @param {string} archive The path to the zip archive to extract.
 *
 * @returns {object} A deferred promise which is resolved once the archiv eie xtracted.
 */
function extractArchive(archive) {
  var extracted = q.defer();

  var unzipper = new DecompressZip(archive);

  unzipper.on('error', function(e) {
    fs.unlinkSync(archive);
    extracted.reject(e);
  });

  unzipper.on('extract', function(log) {
    fs.unlinkSync(archive);
    if(log.length > 0) {
      var parent = log[0];
      if(parent.folder) {
        console.log('Archive extracted successfully to "%s"', TMP_DIR);
        extracted.resolve(path.resolve(TMP_DIR, parent.folder));
      } else {
        log.forEach(function(f) {
          rimraf(path.resolve(TMP_DIR, f.folder || f.deflated), function() {
            extracted.reject('Invalid recipe format.');
          });
        });
      }
    } else {
      generated.reject('Invalid recipe, no files in downloaded archive.');
    }
  });

  console.log(util.format('Unarchiving "%s"', archive));
  unzipper.extract({
    path: TMP_DIR
  });

  return extracted.promise;
}

/**
 * Downloads the contents of the specified url.
 *
 * @param {string} url The url to download.
 *
 * @returns {object} A deferred promise which is resolved once the resources
 *                   at the specified url have been downloaded.
 */
function downloadArchive(url) {
  var downloaded = q.defer();

  // We'll pipe the download into this file
  var archive = path.resolve(TMP_DIR, Date.now() + '-archive.zip');
  var ws = fs.createWriteStream(archive);

  console.log(util.format('Downloading "%s"', url));
  request.get(url, function(err, res, body) {
      if(err || res.statusCode !== 200) {
        fs.unlinkSync(archive);
        if(!err) {
          err = util.format('Invalid recipe url: "%s"', url);
        }
        downloaded.reject(err || res.statusText);
      } else {
        console.log('Download complete.');
        downloaded.resolve(archive);
      }
    }).pipe(ws);

  return downloaded.promise;
}

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

/**
 * The chef. Creator of the ultimate flapjack.
 *
 * The Chef class is responsible for generating a new flapjack project from an
 * external recipe.
 */
module.exports = {
  /**
   * Generates a new flapjack project from the given recipe url in the provided
   * destination.
   *
   * @param   {string} url      The url to the recipe as a zip archive.
   * @param   {string} [dest=.] The path where the project should be generated. Defaults
   *                            to the current working directory.
   *
   * @returns {object} A deferred promise which is resolved when generation succeeds.
   */
  generate: function(url, dest) {
    var generated = q.defer();

    if(typeof url !== 'string') {
      throw util.format('Invalid recipe url: "%s"', url);
    }

    // Support github urls easily since that's what most recipes will likely
    // be.  This takes something like allenai/angular-web.recipe and converts
    // it to https://github.com/allenai/angular-web.recipe/archive/master.zip
    if(!REGEXP_ABS_URL.test(url)) {
      url = githubArchiveUrl(url);
    }

    // Default to the current working directory
    if(!dest) {
      dest = process.cwd();
    }

    // Make sure we have a fully resolved path
    dest = path.resolve(dest);

    // Create the target directory if it doesn't exist
    if(!fs.existsSync(dest)) {
      fs.mkdirSync(dest);
    }

    // Make sure our destination is a valid directory
    if(!fs.statSync(dest).isDirectory()) {
      throw util.format('Invalid destination: "%s"', dest);
    }

    // Go!
    return downloadArchive(url)
      .then(extractArchive)
      .then(function(extracted) {
        return move(extracted, dest);
      })
      .then(installDependencies)
      .then(function() {
        return util.format('Your new flapjack is ready: "%s"', dest.magenta);
      });
  }
};
