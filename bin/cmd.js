#!/usr/bin/env node
var flapjack = require('../');
var fs = require('fs');
var minimist = require('minimist');
var Log = require('log');

var log = new Log('info');

var args = minimist(process.argv);

function usage() {
  console.log('\n' + fs.readFileSync(__dirname + '/usage.txt', 'utf-8'));
}

if(args.help) {
  usage();
  process.exit();
}

var command = args._.slice(2).shift();

// Take method names which are dash-seperated instead of camel-cased
// and convert them into the equivalent camel-cased method name.
// For example, "start-server" becomes "startServer";
var methodName = '';
if(command) {
  command.split('-').forEach(function(part, i) {
    if(i !== 0) {
      part = part.substr(0, 1).toUpperCase() + part.substr(1);
    }
    methodName += part;
  });
}

if(flapjack.hasOwnProperty(methodName) && typeof flapjack[methodName] === 'function') {
  try {
    flapjack[methodName].apply(flapjack, args._.slice(3)).then(
      function(message) {
        if(message) {
          log.info(message);
        }
        process.exit(0);
      },
      function(error) {
        if(error) {
          log.error(error);
          usage();
        }
        process.exit(1);
      }
    );
  } catch(e) {
    log.error(e.toString());
    usage();
    process.exit(1);
  }
} else {
  usage();
  process.exit(1);
}
