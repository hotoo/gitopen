/* global module, process */
var fs = require('fs');
var path = require('path');
var commander = require('commander');

// resolve absolute path to relative path base repository root.
function resolve(filepath, cwd, root) {
  return path.normalize(path.join(cwd, filepath))
            .replace(root, '');
}

// @param {argv} process.argv
// @param {String} cwb, current working branch name.
module.exports = function(argv, option) {
  commander
    .version(require('../package.json').version)
    .option('-p, --path <path>', 'CWD path')
    .option('-b, --branch <branch-name>', 'Goto branch in browser')
    .option('-r, --remote <remote-name>', 'Goto remote in browser, default is `origin`.')
    .option('-v, --verbose', 'Print verbose information.')
    .parse(argv);

  var options = {
    category: 'home',
    cwd: commander.path || option.cwd || process.cwd(),
    hash: commander.branch || option.cwb || 'master',
    remote: commander.remote || 'origin',
    protocol: 'https',
    verbose: commander.verbose,
  };

  // prepare processing branch alias like `:branch-name`
  for (var i=commander.args.length-1; i>=0; i--) {
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

  var category = commander.args[0];
  var match;

  switch(category){
  case 'issue':
    options.category = 'issues/new';
    options.args = {
      title: commander.args.slice(1).join(' ')
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
    options.category = 'milestones/new';
    options.args = {
      title: commander.args.slice(1).join(' ')
    }
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
  case 'commits':
    options.category = 'commits';
    if (commander.branch) {
      options.category = 'commits-with-branch';
    }
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
    } else if (m = RE_PR_ID.exec(category)) {
      options.category = 'pulls/id';
      options.args = {
        pull_id: m[1],
      };
    } else if (m = RE_PROFILE.exec(category)) {
      var username = m[1];
      var reponame = m[2];
      options.category = 'profile';
      options.args = {
        username: username,
        reponame: reponame,
      };
    } else if (m = RE_MILESTONE.exec(category)) {
      options.category = 'milestones/id';
      options.args = {
        milestone_id: m[1],
      };
    } else if (m = RE_GIST.exec(category)) {
      options.category = 'snippets/new';
      options.args = {
        type: m[1],
      };
    } else {
      // FILE/DIR PATH
      if (fs.existsSync(category)) {
        var filepath = resolve(category, option.cwd, option.root); // path.normalize(category)
        var stat = fs.statSync(category);
        if (stat.isFile()) {
          options.category = 'blob';
          options.args = {
            cwd: path.dirname(filepath),
            path: filepath,
          };
        } else if (stat.isDirectory()) {
          options.category = 'tree';
          options.args = {
            cwd: path.resolve(filepath, options.cwd),
            path: filepath,
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
