var path = require('path');
var futil = require('flapjack-util');

var gulp = require(path.resolve(process.cwd(), 'node_modules', 'gulp'));
require(path.resolve(process.cwd(), 'gulpfile.js'));

process.on('message', function(m) {
  var message = new futil.GulpMessage(m);
  if(message.data === 'start') {
    gulp.start('default', function() {
      new futil.GulpMessage(futil.GulpMessage.Type.MESSAGE, 'complete').send();
    });
  }
});
