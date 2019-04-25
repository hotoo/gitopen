'use strict';
/* global exports, process */

var child_process = require('child_process');

/**
 * 获取 remote name。
 * remote 不同，URL 就完全不同，后面所有的配置等都会受影响。
 * @param {Object} options 参数配置
 * @return {String} remote name
 */
exports.getRemoteName = function(options) {
  if (!options) {
    options = {};
  }
  if (options.remote) {
    return options.remote;
  }
  try {
    return child_process.execSync(
      'git config gitopen.remote',
      { cwd: options.cwd || process.cwd() }
    ).toString().trim() || 'origin';
  } catch (ex) {
    return 'origin';
  }
};

exports.getRemoteUrl = function getRemoteUrl(options) {
  if (!options) {
    options = {};
  }
  var cwd = options.cwd || process.cwd();
  var uri = child_process.execSync(
      'git config remote.' + (options.remote || 'origin') + '.url',
      {cwd: cwd}
    ).toString().trim();

  if (!uri) {
    throw new Error('Can not get remote url from dir: ' + cwd);
  }

  return uri;
};

exports.getCurrentBranch = function getCurrentBranch(cwd) {
  var cmds = [
    'git symbolic-ref --short HEAD',
    'git rev-parse --abbrev-ref HEAD',
  ];
  for (var i = 0, l = cmds.length; i < l; i++) {
    try {
      var out = child_process.execSync(cmds[i], {cwd: cwd})
          .toString().trim();
      if (out.indexOf('fatal: ') === 0) {
        return null;
      }
      return out;
    } catch (ex) { /* */ }
  }
  return null;
};

exports.getGitRootPath = function(cwd) {
  try {
    return child_process.execSync('git rev-parse --show-toplevel', {cwd: cwd})
            .toString().trim();
  } catch (ex) {
    return null;
  }
};

var RE_REMOTE_BRANCH_NAME = /^(\w+)\/(.+)/; // "origin/branch-name"
exports.getRemoteBranches = function(cwd) {
  var remoteBranches = child_process.execSync(
      'git branch -r',
      {cwd: cwd}
    ).toString()
    .trim()
    .split(/\r\n|\r|\n/)
    .filter(function(branchName) {
      return branchName &&
        branchName.indexOf(' -> ') === -1; // `  origin/HEAD -> origin/master`
    })
    .map(function(branchName) {
      var br = branchName.trim();
      var m = RE_REMOTE_BRANCH_NAME.exec(br);
      return {
        fullName: br,
        remote: m[1],
        name: m[2],
      };
    });
  return remoteBranches;
};

var RE_CURRENT_BASE_BRANCHES = /^[ -+]*\*/;
var RE_BASE_BRANCHE_NAME = /.*?\[([^\]\^~]+).*/; // " +*   [MS170216105211~2^2] test: fixed lint"
exports.getBaseBranches = function(cwd) {
  var cwb = exports.getCurrentBranch(cwd);
  var baseBranches = child_process.execSync(
      'git show-branch --no-color',
      {cwd: cwd}
    ).toString()
    .trim()
    .split(/\r\n|\r|\n/)
    .filter(function(line) {
      return RE_CURRENT_BASE_BRANCHES.test(line);
    })
    .map(function(line) {
      var m = RE_BASE_BRANCHE_NAME.exec(line);
      return m ? m[1] : null;
    })
    .filter(function(branchName) {
      return branchName !== cwb;
    });
  // TODO: 获取当前分支的所有祖先分支列表，并按照倒序排列，最近切出的祖先分支排第一。
  return baseBranches.length >= 0 ? [baseBranches[0]] : [];
  // return unique(baseBranches);
};

// 转义分支名称。
// 直接 encodeURIComponent 会将 `/` 也进行转换。
// @param {String} branchName: 分支名称。
// @return {String} 转义后的分支名称。
exports.encodeBranchName = function(branchName) {
  return encodeURIComponent(branchName).replace(/%2F/g, '/');
};

// function unique(array) {
  // return array.filter(function(item, index) {
    // var firstIndex = array.indexOf(item);
    // return firstIndex === index;
  // });
// }
