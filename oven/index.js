#!/usr/bin/env node
var express = require('express');
var util = require('util');
var q = require('q');
var path = require('path');
var colors = require('colors');
var cookieParser = require('cookie-parser');
var fs = require('fs');
var handlebars = require('express-handlebars');

var Biscuit = require('../biscuit');

// This script takes two arguments, the path to biscuit and the port on which
// to bind the HTTP server.
// ie:
// node server/oven scaffold/src 8080
var port = process.argv.pop();
var src = process.argv.pop();

src = src && path.resolve(src);

if(!port) {
  console.error(util.format('Invalid port: %s', port).red);
  process.exit(1);
  return;
}

try {
  var biscuit = new Biscuit(src);
} catch(e) {
  console.error(e.toString().red);
  process.exit(1);
  return;
}

var app = express();

app.set('views', __dirname + '/views');
app.engine(
    'handlebars',
    handlebars({
      defaultLayout: 'main',
      layoutsDir: app.get('views') + '/layouts'
    })
  );
app.set('view engine', 'handlebars');

app.use(cookieParser());

app.use(function(request, response, next) {
  //
  // Only trigger a build on a request for the index.  If we're currently
  // building wait for the resolution of the current build before returning
  // anything.
  //
  // This is designed to prevent requests for the js files, assets and other
  // static resources from triggering repetative builds when really only
  // one is necessary with each render cycle.
  //
  // TODO: There might be a more elegant way to solve this.
  //
  if(request.path === '/' || biscuit.isBaking()) {
    biscuit.bake().then(
      function() {
        next();
      },
      function(error) {
        response.render('error', {
            title: 'Gulp Build Error',
            error: error
          });
      }
    );
  } else {
    next();
  }
});

app.use(express.static(biscuit.paths.BUILD));

app.listen(port, function() {
  console.log(
      util.format('%s server started\nSource: %s\nBuild: %s\nPort: %s',
        'Biscuit'.cyan, biscuit.paths.SRC.magenta, biscuit.paths.BUILD.magenta,
        port.green
      )
    );
  if(typeof process.send === 'function') {
    process.send('SERVER_STARTED');
  }
});
