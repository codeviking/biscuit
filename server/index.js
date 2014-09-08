var express = require('express');
var util = require('util');
var q = require('q');
var path = require('path');
var fs = require('fs');

var Biscuit = require('../biscuit');

module.exports = {
  start: function(src) {
    var started = q.defer();
    var biscuit = new Biscuit(src);
    var dir = path.resolve(src, '../build')

    if(!src || !fs.statSync(src).isDirectory()) {
      q.reject(util.format('Invalid source directory: %s', src));
    } else {
      var app = express();

      app.disable('x-powered-by');

      app.use(function(request, response, next) {
        response.set('X-Powered-By', 'Biscuit');

        biscuit.bake().then(
          function(dir) {
            next();
          },
          function(errors) {
            // TODO: handle multiple errors and come up with a clean
            // error
            response.send(JSON.stringify(errors.shift()));
          }
        );
      });

      app.use(express.static(dir));

      app.listen('4040', function() {
        started.resolve();
      });
    }

    return started;
  }
}
