#!/usr/bin/env node
var express = require('express');
var util = require('util');
var q = require('q');
var path = require('path');
var colors = require('colors');
var fs = require('fs');
var Biscuit = require('../biscuit');

// This script takes two arguments, the path to the source files and the port
// on which to listen.
// ie:
// node server/oven scaffold/src 8080
var port = process.argv.pop();
var src = process.argv.pop();

src = src && path.resolve(src);

if(!port) {
  console.error(util.format('Invalid port: %s', port).red);
  process.exit(1);
}

if(!src || !fs.existsSync(src) || !fs.statSync(src).isDirectory()) {
  console.error(util.format('Invalid source directory: %s', src).red);
  process.exit(1);
}

var biscuit = new Biscuit(src);
var dir = path.resolve(src, '../build');
var app = express();

app.use(function(request, response, next) {
  biscuit.bake().then(
    function() {
      next();
    },
    function(err) {
      // TODO: *clean* error template
      response.send('<pre>' + ( typeof err !== 'string' ? JSON.stringify(err) : err ) + '</pre>');
    }
  );
});

app.use(express.static(dir));

app.listen(port, function() {
  console.log(util.format('Biscuit'.cyan + ' server attached to ' + src.magenta + ' listening on %s', port.green))
  process.send('SERVER_STARTED');
});
