var flapjack = require('../');
var path = require('path');
var fs = require('fs');
var assert = require('assert');

var TMP_PATH = path.resolve(__dirname,  '../tmp');

describe('flapjack', function() {
  describe('flapjack.generate', function() {
    it('generates a new project into the specified directory', function(done){
      flapjack.generate(TMP_PATH)
        .done(function() {

        });
    });
  });
});
