#!/usr/bin/env node
var flapjack = require('../');
var fs = require('fs');
var colors = require('colors');
var minimist = require('minimist');

var args = minimist(process.argv);

function usage() {
  console.log(fs.readFileSync(__dirname + '/usage.txt', 'utf-8'));
}

if(args.help) {
  usage();
  process.exit();
}

var command = args._.slice(2).shift();
var action;
var actionArgs;

// TODO:
// This could be dyanmic.  Take the command, camel-case
// and attempt o call on the specified.
switch(command) {
  case 'generate':
    action = flapjack.generate;
    actionArgs = args._.slice(3);
    break;
  case 'start-server':
    action = flapjack.startServer;
    actionArgs = args._.slice(3);
    break;
  case 'stop-server':
    action = flapjack.stopServer;
    actionArgs = args._.slice(3);
    break;
  case 'restart-server':
    action = flapjack.restartServer;
    actionArgs = args._.slice(3);
    break;
}

if(action && actionArgs) {
  try {
    action.apply(flapjack, actionArgs).then(
      function(message) {
        if(message) {
          console.log('Success: '.green + message);
        }
        process.exit(0);
      },
      function(error) {
        if(error) {
          console.error('Error: '.red + error);
        }
        process.exit(1);
      }
    );
  } catch(e) {
    console.error('Error: '.red + e.toString());
    console.log();
    usage();
    process.exit(1);
  }
} else {
  usage();
  process.exit(1);
}
