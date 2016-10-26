'use strict';
/* global exports, process */

var child_process = require('child_process');

exports.getRemoteUrl = function getRemoteUrl(options) {
  if (!options) {
    options = {};
  }
  var cwd = options.cwd || process.cwd();
  var uri = child_process.execSync(
      'hg paths ' + (options.remote || 'default'),
      {cwd: cwd}
    ).toString().trim();

  if (!uri) {
    throw new Error('Can not get remote url from dir: ' + cwd);
  }

  return uri;
};

exports.getCurrentBranch = function getCurrentBranch(cwd) {
  try {
    return child_process.execSync('hg branch', {cwd: cwd})
            .toString().trim();
  } catch (ex) {
    return null;
  }
};

exports.getHgRootPath = function(cwd) {
  try {
    return child_process.execSync('hg root', {cwd: cwd})
            .toString().trim();
  } catch (ex) {
    return null;
  }
};
