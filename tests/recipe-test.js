var recipe = require('../lib/recipe');
var assert = require('assert');
var fs = require('fs');
var util = require('util');

describe('recipe', function() {

  var URL = 'http://foo/bar.html';
  var RELATIVE_URL = 'allenai/angular-web.recipe';
  var DIR = 'fixtures';
  var CREATE_ME = DIR + '/create-me';

  beforeEach(function(done) {
    if(fs.existsSync(CREATE_ME)) {
      fs.rmdir(CREATE_ME, done);
    } else {
      done();
    }
  });

  it('throws an exception if no url is given', function() {
    assert.throws(
      function() {
        new Flapjack(undefined, DIR);
      },
      util.format('Invalid url "%s"', undefined)
    );
    assert.throws(
      function() {
        new Flapjack('', DIR);
      },
      util.format('Invalid url "%s"', '')
    );
  });

  it('doesn\'t convert an absolute url', function() {
    var f = new recipe(URL, DIR);
    assert.equal(f.url, URL);
  });

  it('converts a relative url to a github archive url', function() {
    var EXPECTED_URL = 'https://github.com/allenai/angular-web.recipe/archive/master.zip';
    var f = new recipe(RELATIVE_URL, DIR);
    assert.equal(f.url, EXPECTED_URL);
  });

  it('propertly identifies a github archive url', function() {
    var f = new recipe(RELATIVE_URL, DIR);
    assert(f.isGithubArchive());

    f = new recipe(URL, DIR);
    assert(!f.isGithubArchive());

    f = new recipe('https://github.com/allenai/angular-web.recipe/archive/foo-baz.zip', DIR);
    assert(f.isGithubArchive());
  });

  it('doesn\'t create a directory that already exists', function() {
    var f = new recipe(RELATIVE_URL, DIR);
    assert.equal(f.dir, 'fixtures');
  });

  it('creates a directory that doesn\'t exist', function() {
    var f = new recipe(RELATIVE_URL, CREATE_ME);
    assert.equal(f.dir, CREATE_ME);
    assert(fs.existsSync(CREATE_ME));
  });

  it('throws an exception if a file is specified instead of a directory', function() {
    assert.throws(
      function() {
        new recipe(RELATIVE_URL, 'fixtures/file.txt');
      },
      util.format('Invalid target, "%s" is not a directory', 'fixtures/file.txt')
    );
  });

  it('sets the directory default to the current working directory', function() {
    assert.equal(new recipe(RELATIVE_URL).dir, process.cwd());
  });

});
