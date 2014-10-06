#!/usr/bin/env node
var express = require('express');
var util = require('util');
var q = require('q');
var path = require('path');
var colors = require('colors');
var fs = require('fs');
var handlebars = require('express-handlebars');

var Flapjack = require('../flapjack');

// This script takes two arguments, the path to flapjack and the port on which
// to bind the HTTP server.
// ie:
// node server/oven scaffold/src 8080
var port = process.argv.pop();
var src = process.argv.pop();

if(!port) {
  console.error(util.format('Invalid port: %s', port).red);
  process.exit(1);
  return;
}

try {
  var flapjack = new Flapjack(src);
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
fs.watch(flapjack.paths.src, function(event, filename) {
  flapjack.build();
});

// Always trigger a build when the server starts just in case things have changed
// while the server wasn't running.
flapjack.build();

function renderBuildError(response) {
  response.render('error', {
      title: 'Build Error',
      error: flapjack.error
    });
}

app.use(function(request, response, next) {
  switch(flapjack.status()) {
    case Flapjack.Status.BUILDING:
      var success = function() {
        flapjack.removeListener(Flapjack.Event.BUILD_FAILED, failed);
        next();
      };
      var failed = function() {
        flapjack.removeListener(Flapjack.Event.BUILD_SUCCESSFUL, success);
        renderBuildError(response);
      };
      flapjack.once(Flapjack.Event.BUILD_SUCCESSFUL, success);
      flapjack.once(Flapjack.Event.BUILD_FAILED, failed);
      break;
    case Flapjack.Status.LAST_BUILD_FAILED:
      renderBuildError(response);
      break;
    default:
      next();
  }
});

app.use(express.static(flapjack.paths.build));

process.on('message', function(m) {
  if(m === 'start-server') {
    app.listen(port, function() {
      console.log(
          util.format('%s server started\nSource: %s\nBuild: %s\nPort: %s',
            'Flapjack'.cyan, flapjack.paths.src.magenta, flapjack.paths.build.magenta,
            port.green
          )
        );
      if(typeof process.send === 'function') {
        process.send('server-started');
      }
    });
  }
});
