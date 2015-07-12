/* global module, process */

var child_process = require('child_process');
var util = require('util');

var DEFAULT_OPTIONS = {
  cwd: process.cwd(),
  hash: 'master',
  protocol: 'https',
  remote: 'origin',
};

function getRemoteUrl(cwd, origin) {
  try {
    return child_process.execSync(
              'git config remote.' + (origin || 'origin') + '.url',
              {cwd: cwd}
        ).toString().trim();
  } catch (ex) {
    console.error('Can not get remote url from dir: %s', cwd);
    return '';
  }
}

function getCurrentBranch(cwd) {
  return child_process.execSync('git symbolic-ref --short HEAD', {cwd: cwd})
          .toString().trim();
}

var RE_SCP_URL = /^git@/i;
var RE_GIT_URL = /^git:\/\//i;
var RE_SSH_URL = /^ssh:\/\//i;
var RE_HTTP_URL = /^https?:\/\//i;
var RE_FILE_URL = /^file:\/\/\//i;
var RE_GIT_EXT = /\.git$/i;
function resolveGitUrl(uri, options) {
  switch(true){
  case RE_SCP_URL.test(uri):
    return options.protocol + '://' + (uri.replace(RE_SCP_URL, '')
              .replace(':', '/')
              .replace(RE_GIT_EXT, ''));
  case RE_GIT_URL.test(uri):
    return uri.replace(RE_GIT_URL, options.protocol + '://')
              .replace(RE_GIT_EXT, '');
  case RE_SSH_URL.test(uri):
    return uri.replace(RE_SSH_URL, options.protocol + '://')
              .replace(RE_GIT_EXT, '');
  case RE_HTTP_URL.test(uri):
    return uri.replace(RE_GIT_EXT, '');
  case RE_FILE_URL.test(uri):
    return uri;
  default:
    throw new Error('Not Support protocol: ' + uri);
  }
}

var RE_GITHUB = /^https:\/\/github\.com\//;
var RE_GITLIB = /^https:\/\/gitlab\.org\//;
var RE_BITBUCKET = /^https:\/\/bitbucket\.org\//;
var RE_GITCAFE = /^https:\/\/gitcafe\.com\//;
var RE_OSCHINA = /^https:\/\/git\.oschina\.net\//;
function getRemoteType(url) {
  if (RE_GITHUB.test(url)) {
    return 'github';
  } else if (RE_GITLIB.test(url)) {
    return 'gitlab';
  } else if (RE_BITBUCKET.test(url)) {
    return 'bitbucket';
  } else if (RE_GITCAFE.test(url)) {
    return 'gitcafe';
  } else if (RE_OSCHINA.test(url)) {
    return 'oschina';
  }
}

module.exports = function(options) {
  options = util._extend(DEFAULT_OPTIONS, options);
  var cwd = options.cwd;
  var remote = getRemoteUrl(cwd, options.remote);
  var url = resolveGitUrl(remote, options);
  var scheme = options.scheme || require('./scheme-github');
  var path = '';

  switch (options.category) {
    case 'issues':
      path = scheme.issues;
      break;
    case 'issues/id':
      path = scheme['issues/id']
              .replace('{issue-id}', options.args.issue_id);
      break;
    case 'issues/new':
      path = scheme['issues/new'];
      break;
    case 'issues/new-with-title':
      path = scheme['issues/new?title'].replace('{title}', options.args.title);
      break;
    case 'pulls':
      path = scheme.pulls;
      break;
    case 'pulls/new':
      path = scheme['pulls/new'];
      break;
    case 'pulls/new-with-branch':
      path = scheme['pulls/new-with-branch']
                  .replace('{branch-A}', options.args['branch-A'])
                  .replace('{branch-B}', options.args['branch-B'] || getCurrentBranch(cwd));
      break;
    case 'wiki':
      path = scheme.wiki;
      break;
    case 'milestones':
      path = scheme.milestones;
      break;
    case 'tags':
      path = scheme.tags;
      break;
    case 'releases':
      path = scheme.releases;
      break;
    case 'releases/new':
      path = scheme['releases/new'];
      break;
    case 'releases/new-with-tag':
      path = scheme['releases/new-with-tag']
                  .replace('{tag}', options.args.tag);
      break;
    case 'releases/edit/tag-id':
      path = scheme['releases/edit/tag-id']
                  .replace('{tag}', options.args.tag);
      break;
    case 'network':
      path = scheme.network;
      break;
    case 'commits':
      path = scheme.commits;
      break;
    case 'commits-with-branch':
      path = scheme['commits-with-branch']
                  .replace('{branch-name}', options.args.branch);
      break;
    case 'tree':
      path = scheme.tree.replace('{hash}', options.args.hash);
      break;
    case 'blob':
      path = scheme.blob.replace('{hash}', options.args.hash);
      break;
    //case 'home':
    default:
      path = '';
      if (options.hash !== 'master')  {
        path = scheme.tree.replace('{hash}', options.hash);
      }
      break;
  }
  //if (options.path) {
    //path += options.path;
  //}
  return url + path;
};

module.exports.getRemoteUrl = getRemoteUrl;
module.exports.resolveGitUrl = resolveGitUrl;
module.exports.getRemoteType = getRemoteType;
