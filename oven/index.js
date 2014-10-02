#!/usr/bin/env node
var express = require('express');
var util = require('util');
var q = require('q');
var path = require('path');
var colors = require('colors');
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

// Trigger a build whenever something changes in the source directory.
// You're right, gulp could just handle this, but then there'd be no awareness
// from the server's perspective of whether things are building, nor the ability
// to capture errors.
// TODO(samskjonsberg): We *could* put something in our gulp file that outputs a file in
// var/ called build-status or something akin to that, and instead read from that
// and accordingly understand the state of the build. I'd like to discuss this
// with @markschaake and figure out what's best.
fs.watch(biscuit.paths.SRC, function(event, filename) {
  biscuit.bake();
});

// Always trigger a bake when the server starts just in case things have changed
// while the server wasn't running.
biscuit.bake();

function renderBuildError(response) {
  response.render('error', {
      title: 'Build Error',
      error: biscuit.error
    });
}

app.use(function(request, response, next) {
  switch(biscuit.status()) {
    case Biscuit.Status.BAKING:
      var success = function() {
        biscuit.removeListener(Biscuit.Event.BAKING_FAILED, failed);
        next();
      };
      var failed = function() {
        biscuit.removeListener(Biscuit.Event.BAKING_SUCCESS, success);
        renderBuildError(response);
      };
      biscuit.once(Biscuit.Event.BAKING_SUCCESS, success);
      biscuit.once(Biscuit.Event.BAKING_FAILED, failed);
      break;
    case Biscuit.Status.LAST_BAKE_FAILED:
      renderBuildError(response);
      break;
    default:
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
