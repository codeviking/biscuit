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

        });
    });
  });
});
