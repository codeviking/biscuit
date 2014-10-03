#!/usr/bin/env node
var biscuit = require('../');
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
    action = biscuit.generate;
    actionArgs = args._.slice(3);
    break;
  case 'start-server':
    action = biscuit.startServer;
    actionArgs = args._.slice(3);
    break;
  case 'stop-server':
    action = biscuit.stopServer;
    actionArgs = args._.slice(3);
    break;
  case 'restart-server':
    action = biscuit.restartServer;
    actionArgs = args._.slice(3);
    break;
}

if(action && actionArgs) {
  try {
    action.apply(biscuit, actionArgs).then(
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
