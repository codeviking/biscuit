var biscuit = require('../');
var path = require('path');
var fs = require('fs');
var assert = require('assert');

var TMP_PATH = path.resolve(__dirname,  '../tmp');

describe('biscuit', function() {
  describe('biscuit.generate', function() {
    it('generates a new project into the specified directory', function(done){
      biscuit.generate(TMP_PATH)
        .done(function() {
          // TODO: Write a more advanced mechanism for comparing the contents of
          // scaffold with this in TMP_PATH
          // TODO: Look into why the mocha report of errors is so nasty
          assert.notEqual(-1, fs.readdirSync(TMP_PATH).indexOf('public'), 'Directory not found.');
          done();
        });
    });
  });
});
