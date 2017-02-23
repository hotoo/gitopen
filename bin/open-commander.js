'use strict';

var fs = require('fs');
var path = require('path');
var commander = require('commander');
// var inquirer = require('inquirer');
var gitremote = require('../lib/gitremote');

// resolve absolute path to relative path base repository root.
function resolve(filepath, cwd, root) {
  return path.normalize(path.join(cwd, filepath))
            .replace(root, '');
}

// @param {argv} process.argv
// @param {String} cwb, current working branch name.
module.exports = function(argv, option, callback) {

  function parseFilePath(options, cpath) {
    try {
      var stat = fs.statSync(cpath); // throw error when cpath is not accessable.

      var filepath = resolve(cpath, option.cwd, option.root);
      if (stat.isFile()) {
        options.category = 'blob';
        options.args = {
          cwd: path.dirname(filepath),
          path: filepath,
        };
        return options;
      } else if (stat.isDirectory()) {
        options.category = 'tree';
        options.args = {
          cwd: path.resolve(filepath, options.cwd),
          path: filepath,
        };
        return options;
      } else {
        return null;
      }
    } catch (ex) {
      return null;
    }
  }

  commander
    .version(require('../package.json').version)
    .usage('[command] [options]')
    .option('-p, --path <path>', 'CWD path')
    .option('-b, --branch <branch-name>', 'Specify branch, default is current working branch, also support alias `:branch`')
    .option('-r, --remote <remote-name>', 'Goto remote in browser, default is `origin`.')
    .option('-v, --verbose', 'Print verbose information.')
    .on('--help', function() {
      console.log('  Local Commanders:');
      console.log();
      console.log('    issue [title]                Open new issues with optional title');
      console.log('    issues                       Open issues list page');
      console.log('    #1                           Open issues by id');
      console.log('    pull                         Open new pull/merge request by given branch, default is current working branch. alias `pr`, `mr`.');
      console.log('    pulls                        Open pull/merge request list page');
      console.log('    !1                           Open pull/merge request by id, alias `pr1`, `mr@1`, `pull#1`, support sparator `@`, `#`, `-`, `:`');
      console.log('    {filepath}                   Open filepath by given branch, default is current working branch.');
      console.log('    {directory}                  Open directory by given branch, default is current working branch.');
      console.log('    wiki                         Open wiki page');
      console.log('    commits                      Open commits list page, alias `ci`');
      console.log('    branches                     Open branches list page, alias `brs` and `branchs`');
      console.log('    tags                         Open tags list page');
      console.log('    milestones                   Open milestones list page');
      console.log('    milestones#1                 Open milestones by id');
      console.log('    milestone                    Open new milestone');
      console.log('    releases                     Open releases list page, alias `release`.');
      console.log('    releases new <tag>           Open new releases list page');
      console.log('    releases edit <tag>          Edit release by tag');
      console.log('    network                      Open repository network page.');
      console.log('    snippet                      Open new snippet on current repository\'s code hosting. support GitHub, GitLab, BitBucket.');
      console.log();
      console.log('  Global Commanders (out of repository directory):');
      console.log();
      console.log('    @lizzie                      Open lizzie\'s profile page');
      console.log('    @hotoo/gitopen               Open https://github.com/hotoo/gitopen repository homepage.');
      console.log('    snippet                      Open new snippet on https://gist.github.com/');
      console.log();
    })
    .parse(argv);

  var options = {
    category: 'home',
    cwd: commander.path ? path.dirname(commander.path) : option.cwd || process.cwd(),
    hash: commander.branch || option.cwb || 'master',
    remote: commander.remote || 'origin',
    protocol: 'https',
    verbose: commander.verbose,
  };

  // prepare processing branch alias like `:branch-name`
  for (var i = commander.args.length - 1; i >= 0; i--) {
    if (commander.args[i].indexOf(':') === 0) {
      var br = commander.args[i].substring(1);
      options.hash = br;
      commander.branch = br;
      commander.args.splice(i, 1);
    }
  }

  var RE_ISSUE_ID = /^#\d+$/;
  var RE_PR_ID = /^(?:!|(?:pr|mr)[\-:\/#@]?)(\d+)$/i;
  var RE_PROFILE = /^@([a-z0-9-_]+)(?:\/([a-z0-9-_]+)(?:#\d+|:\w+|\/\w+)?)?$/i;
  var RE_MILESTONE = /^milestones?[@\/:#\-](.+)$/i;
  var RE_GIST = /^(?:gist|snippet|snip)(?:@(.+))?$/i;
  // branch-a:branch-b
  // branch-a...branch-b
  var RE_BRANCH_COMPARE = /^(.*?)(?::|\.{3})(.*)$/;
  var RE_HASH = /^[0-9a-fA-F]{6,40}$/;

  var category = commander.args[0];
  var match;

  switch (category) {
  case 'issue':
    options.category = 'issues/new';
    options.args = {
      title: commander.args.slice(1).join(' '),
    };
    break;
  case 'issues':
    options.category = 'issues';
    break;
  case 'pr':
  case 'mr':
  case 'pull':
    options.category = 'pulls/new';
    // current working branch name.
    if (commander.args.length === 1) { // gitopen pr
      options.args = {
        'branch-B': option.cwb,
      };
    } else if (commander.args.length === 2) { // gitopen pr branchName
      match = RE_BRANCH_COMPARE.exec(commander.args[1]);
      if (match) { // gitopen pr a...b
        options.args = {
          'branch-A': match[1],
          'branch-B': match[2] || option.cwb,
        };
      } else { // gitopen pr branchName
        options.args = {
          'branch-B': commander.args[1],
        };
      }
    } else if (commander.args.length >= 3) {
      options.args = {
        'branch-A': commander.args[1],
        'branch-B': commander.args[2] || option.cwb,
      };
    }

    if (!options.args['branch-A']) {
      var cwd = commander.cwd || process.cwd();
      var remoteBranches = gitremote.getBaseBranches(cwd);
      var remoteBranchLength = remoteBranches.length;
      if (remoteBranchLength === 0) {
        console.log('Not found base branch, rebase it before create PR/MR.');
        return;
        // remoteBranches = gitremote.getRemoteBranches(cwd)
          // .map(function(br) {
            // return br.name;
          // })
          // .filter(function(name) {
            // return name !== option.cwb;
          // });
      }
      // TODO: 目前这个分支走不到，后面获取所有的祖先分支列表时再供用户选择。
      // if (remoteBranchLength > 1) {
        // inquirer.prompt([{
          // name: 'remoteBranch',
          // type: 'list',
          // message: 'Choose remote brance to compare:',
          // choices: remoteBranches,
        // }]).then(function(answers) {
          // options.args['branch-A'] = answers.remoteBranch;
          // return callback(options);
        // });
        // return;
      // }
      options.args['branch-A'] = remoteBranches[0];
    }

    break;
  case 'pulls':
  case 'prs':
  case 'mrs':
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
    options.category = 'milestones/new';
    options.args = {
      title: commander.args.slice(1).join(' '),
    };
    break;
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
    // options.category = 'commit';
    // if (commander.args[2] && commander.args[2] !== '.') {
      // options.hash = commander.args[2];
    // }
    // break;
  case 'commits':
    options.category = 'commits';
    if (commander.branch) {
      options.category = 'commits-with-branch';
    }
    break;
  case 'brs':
  case 'branchs':
  case 'branches':
    options.category = 'branches';
    break;
  case 'gist':
  case 'snip':
  case 'snippet':
    options.category = 'snippets/new';
    options.args = {
      type: 'github',
    };
    break;
  case undefined: // 未指定任何特定信息。
    options.category = 'home';
    if (commander.branch) {
      options.category = 'tree';
      options.args = {
        path: '',
      };
    }
    break;
  default:
    var m;
    if (category.indexOf(':') === 0) {
      options.category = 'tree';
      options.hash = category.substring(1);
      options.args = {
        path: '',
      };
    } else if (RE_ISSUE_ID.test(category)) {
      options.category = 'issues/id';
      options.args = {
        issue_id: category.substring(1),
      };
    } else if ((m = RE_PR_ID.exec(category))) {
      options.category = 'pulls/id';
      options.args = {
        pull_id: m[1],
      };
    } else if ((m = RE_PROFILE.exec(category))) {
      var username = m[1];
      var reponame = m[2];
      options.category = 'profile';
      options.args = {
        username: username,
        reponame: reponame,
      };
    } else if ((m = RE_MILESTONE.exec(category))) {
      options.category = 'milestones/id';
      options.args = {
        milestone_id: m[1],
      };
    } else if ((m = RE_GIST.exec(category))) {
      options.category = 'snippets/new';
      options.args = {
        type: m[1],
      };
    } else if (RE_HASH.test(category)) {
      options.category = 'commit';
      options.hash = category;
    } else {
      // FILE/DIR PATH
      if (!parseFilePath(options, category)) {
        console.error('Unknow category or path: ' + category);
        process.exit(1);
      }
    }
  }

  if (commander.path && !parseFilePath(options, commander.path)) {
    console.error('Unknow path: ' + commander.path);
    process.exit(1);
  }

  callback(options);
};
