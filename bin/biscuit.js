#!/usr/bin/env node
var biscuit = require('../');
var fs = require('fs');
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
switch(command) {
  case 'generate':
    biscuit.generate.apply(biscuit, args._.slice(3));
    break;
  default:
    usage();
    process.exit(1);
    break;
}
