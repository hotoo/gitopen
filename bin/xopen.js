/* global module */

var commander = require('commander');
var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var gitresolve = require('../lib/index');
var gitremote = require('../lib/gitremote');
var DEFAULT_CONFIG = require('../lib/gitopenrc');
var xopen = require('../lib/xopen');

module.exports = function(uri, argv){
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
  };

  var RE_ISSUE_ID = /^#\d+$/;
  var RE_PROFILE = /^@([a-z0-9-_]+)(?:\/([a-z0-9-_]+)(?:#\d+|:\w+|\/\w+)?)?$/i;
  var RE_BRANCH_COMPARE = /^(\w+)?:(\w+)?$/;

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
  case 'pulls':
    options.category = 'pulls';
    if (commander.args[1] === 'new') {
      options.category = 'pulls/new';
    } else if (match = RE_BRANCH_COMPARE.exec(commander.args[1])) {
      options.category = 'pulls/new-with-branch';
      options.args = {
        'branch-A': match[1] || 'master',
        'branch-B': match[2] || gitremote.getCurrentBranch(options.cwd),
      };
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
      xopen('https://github.com/' + username + (reponame? '/'+reponame : ''), commander);
      process.exit(0);
      return 0;
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

  var config = getConfig(uri);
  options.scheme = config.scheme;
  options.protocol = config.protocol;

  return options;
}


function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

var $HOME = exports.$HOME = getUserHome();

function getConfig(uri) {
  var HOSTNAME = gitresolve.parse(uri).hostname;
  var config = DEFAULT_CONFIG[HOSTNAME];

  if (config) {
    return {
      type: config.type,
      scheme: require('../lib/scheme/' + DEFAULT_CONFIG[HOSTNAME].type),
      protocol: config.protocol,
    };
  }

  var gitopenrc = path.join($HOME, '.gitopenrc');
  var result = {};
  if (fs.existsSync(gitopenrc)) {
    try {
      config = yaml.safeLoad(fs.readFileSync(gitopenrc, 'utf8'));
      Object.keys(config).some(function(hostname){
        if (HOSTNAME === hostname) {
          result.protocol = config[hostname].protocol || 'https';
          result.type = config[hostname].type;
          var type = config[hostname].type;
          if (type === 'custom') {
            result.scheme = config[hostname].scheme || {};
          } else {
            result.scheme = require('../lib/scheme/' + config[hostname].type);
          }
          return true;
        }
      });
      return result;
    } catch (ex) {
      console.error('Read .gitopenrc error: %s', ex.message);
      process.exit(1);
      return 1;
    }
  }
}
