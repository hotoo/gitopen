'use strict';

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

/**
 * 解析 `git show-branch` 的输出，得到当前分支的基准分支。
 * @param {String} showBranch 当前分支 `git show-branch` 的输出。
 * @return {Array} base branch name
 */
exports.parseBaseBranchName = function(showBranch) {
  // 上下上个部分使用 -- 分隔。
  const info = showBranch.split(/^-+$/m);
  // 查找当前分支。
  // -- 上面的部分包含当前分支。
  const RE_CURRENT_BRANCH = /^(\s*)\*\s+\[([^\]]+)\]/m;
  const m = RE_CURRENT_BRANCH.exec(info[0]);
  // 输入异常，没有找到当前分支。
  if (!m) {
    return '';
  }
  // 当前分支所在的列数
  const currBranchIndent = m[1].length;
  const currBranchName = m[2];

  // 从 -- 下面的部分查找当前分支所在列有 *+- 符号的行所在的分支。
  const brs = info[1].split(/\r\n|\r|\n/);
  return brs
    .map(br => {
      var RE_BASE_BRANCHE_NAME = /^[ *+-]*\[([^\]\^~]+)/; // " +*   [MS170216105211~2^2] test: fixed lint"
      const m2 = RE_BASE_BRANCHE_NAME.exec(br);
      // 解析异常，没有找到分支信息，一般是 \n 导致的空行。
      if (!m2) {
        return null;
      }
      const brName = m2[1];
      return {
        brName,
        currBranchEffect: '*+-'.includes(br.charAt(currBranchIndent)),
      };
    })
    .filter(br => {
      return br &&
        br.brName !== currBranchName &&
        br.currBranchEffect;
    })
    .map(br => br.brName);
};

exports.getBaseBranches = function(cwd) {
  var showBranch = child_process.execSync(
    'git show-branch --no-color',
    {cwd: cwd}
  ).toString();
  const baseBranches = exports.parseBaseBranchName(showBranch);
  return baseBranches;
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
