/* global module, process */
var fs = require('fs');
var path = require('path');
var commander = require('commander');
var gitremote = require('../lib/gitremote');

module.exports = function(argv) {
  commander
    .version(require('../package.json').version)
    .option('-p, --path <path>', 'CWD path')
    .option('-b, --branch <branch-name>', 'Goto branch in browser')
    .option('-r, --remote <remote-name>', 'Goto remote in browser, default is `origin`.')
    .option('-v, --verbose', 'Print verbose information.')
    .parse(argv);

  var options = {
    category: 'home',
    cwd: commander.path || process.cwd(),
    hash: commander.branch || 'master',
    remote: commander.remote || 'origin',
    protocol: 'https',
    verbose: commander.verbose,
  };

  var RE_ISSUE_ID = /^#\d+$/;
  var RE_PROFILE = /^@([a-z0-9-_]+)(?:\/([a-z0-9-_]+)(?:#\d+|:\w+|\/\w+)?)?$/i;
  // branch-a:branch-b
  // branch-a...branch-b
  var RE_BRANCH_COMPARE = /^(.*?)(?::|\.{3})(.*)$/;

  var category = commander.args[0];
  var match;

  switch(category){
  case 'issue':
  case 'issues':
    options.category = 'issues';
    if (commander.args[1] === 'new') {
      options.category = 'issues/new';
      if (commander.args[2]) {
        options.category = 'issues/new-with-title';
        options.args = {
          title: commander.args[2]
        };
      }
    }
    break;
  case 'pr':
  case 'mr':
  case 'pull':
    options.category = 'pulls/new';
    // current working branch name.
    var cwb = gitremote.getCurrentBranch(options.cwd);
    if (commander.args.length === 1) { // gitopen pr
      options.args = {
        'branch-B': cwb,
      };
    } else if (commander.args.length === 2) { // gitopen pr branchName
      match = RE_BRANCH_COMPARE.exec(commander.args[1]);
      if (match) { // gitopen pr a...b
        options.args = {
          'branch-A': match[1],
          'branch-B': match[2] || cwb,
        };
      } else { // gitopen pr branchName
        options.args = {
          'branch-B': commander.args[1],
        };
      }
    } else if (commander.args.length >= 3) {
      options.args = {
        'branch-A': commander.args[1],
        'branch-B': commander.args[2] || cwb,
      };
    }
    break;
  case 'pulls':
    options.category = 'pulls';
    if (commander.args[1] === 'new') {
      options.category = 'pulls/new';
    }
    break;
  case 'wiki':
  case 'wikis':
    options.category = 'wiki';
    break;
  case 'tag':
  case 'tags':
    options.category = 'tags';
    break;
  case 'milestone':
  case 'milestones':
    options.category = 'milestones';
    break;
  case 'release':
  case 'releases':
    options.category = 'releases';
    if (commander.args[1] === 'new') {
      options.category = 'releases/new';
      if (commander.args[2]) {
        options.category = 'releases/new-with-tag';
        options.args = {
          tag: commander.args[2],
        };
      }
    } else if (commander.args[1] === 'edit') {
      options.category = 'releases/edit/tag-id';
      options.args = {
        tag: commander.args[2],
      };
    }
    break;
  case 'network':
    options.category = 'network';
    break;
  case 'ci':
  case 'commit':
  case 'commits':
    options.category = 'commits';
    if (commander.branch) {
      options.category = 'commits-with-branch';
      options.args = {
        hash: commander.branch,
      };
    }
    break;
  case undefined: // 未指定任何特定信息。
    options.category = 'home';
    if (commander.branch) {
      options.category = 'tree';
      options.args = {
        hash: commander.branch,
      };
    }
    break;
  default:
    var m;
    if (category.indexOf(':') === 0) {
      options.category = 'tree';
      options.args = {
        hash: category.substring(1),
      };
    } else if (RE_ISSUE_ID.test(category)) {
      options.category = 'issues/id';
      options.args = {
        issue_id: category.substring(1),
      };
    } else if (m = RE_PROFILE.exec(category)) {
      // TODO: profile
      var username = m[1];
      var reponame = m[2];
      options.category = 'profile';
      options.args = {
        username: username,
        reponame: reponame,
      };
      //xopen('https://github.com/' + username + (reponame? '/'+reponame : ''), commander);
    } else {
      // FILE/DIR PATH
      if (fs.existsSync(category)) {
        var stat = fs.statSync(category);
        if (stat.isFile()) {
          options.category = 'blob';
          options.args = {
            cwd: path.dirname(category),
            file: path.normalize(category),
          };
        } else if (stat.isDirectory()) {
          options.category = 'tree';
          options.args = {
            cwd: path.resolve(category, options.cwd),
            subpath: category,
          };
        }
      } else {
        console.error('Unknow category or path: ' + category);
        process.exit(1);
        return 1;
      }
    }
  }

  return options;
};
