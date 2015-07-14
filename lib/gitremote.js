/* global exports, process */

var child_process = require('child_process');

exports.getRemoteUrl = function getRemoteUrl(options) {
  if (!options) {
    options = {};
  }
  var cwd = options.cwd || process.cwd();
  var uri = child_process.execSync(
      'git config remote.' + (options.origin || 'origin') + '.url',
      {cwd: cwd}
    ).toString().trim();

  if (!uri) {
    throw new Error('Can not get remote url from dir: ' + cwd);
  }

  return uri;
};

exports.getCurrentBranch = function getCurrentBranch(cwd) {
  return child_process.execSync('git symbolic-ref --short HEAD', {cwd: cwd})
          .toString().trim();
};
