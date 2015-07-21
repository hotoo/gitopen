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
  var cmds = [
    'git describe --contains --all HEAD',
    'git symbolic-ref --short HEAD',
    'git rev-parse --abbrev-ref HEAD',
  ];
  for (var i=0, l=cmds.length; i<l; i++) {
    try {
      return child_process.execSync(cmds[i], {cwd: cwd})
          .toString().trim();
    } catch (ex){}
  }
  throw new Error('Can\'t get current branch name.');
};
