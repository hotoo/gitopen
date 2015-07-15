/* global module */

function merge() {
  var args = Array.prototype.slice.call(arguments);
  var merged = {};
  args.forEach(function(object) {
    Object.keys(object).forEach(function(key) {
      merged[key] = object[key];
    });
  });
  return merged;
}

var DEFAULT_OPTIONS = {
  hash: 'master',
  protocol: 'https',
  remote: 'origin',
  scheme: {
    base: '{protocol}://{hostname}/{username}/{reponame}'
  }
};

//                 git@hostname:username/reponame.git
var RE_SCP_URL = /^git@([^:]+):([^\/]+)\/(.+?)(?:\.git)?$/i;
//                 git://hostname/username/reponame.git
var RE_GIT_URL = /^git:\/\/([^\/]+)\/([^\/]+)\/(.+?)(?:\.git)?$/i;
//                 ssh://hostname/username/reponame.git
var RE_SSH_URL = /^ssh:\/\/([^\/]+)\/([^\/]+)\/(.+?)(?:\.git)?$/i;
//                  https://hostname/username/reponame.git
var RE_HTTP_URL = /^https?:\/\/(?:[a-z0-9-_]+@)?([^\/]+)\/([^\/]+)\/(.+?)(?:\.git)?$/i;

function parse(uri) {
  var match = RE_SCP_URL.exec(uri) ||
              RE_GIT_URL.exec(uri) ||
              RE_SSH_URL.exec(uri) ||
              RE_HTTP_URL.exec(uri);

  if (!match) {
    throw new Error('Can not resolve url: ' + uri);
  }

  return {
    hostname: match[1],
    username: match[2],
    reponame: match[3],
  };
}

function resolve(uri, options) {
  options = merge(DEFAULT_OPTIONS, options);
  var protocol = options.protocol || 'https';
  var parsedUri = parse(uri);

  return options.scheme.base.replace('{protocol}', protocol)
                     .replace('{hostname}', parsedUri.hostname)
                     .replace('{username}', parsedUri.username)
                     .replace('{reponame}', parsedUri.reponame);
}

module.exports = function(uri, options) {
  options = merge(DEFAULT_OPTIONS, options);
  var url = resolve(uri, options);
  var scheme = options.scheme || require('./scheme/github');
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
                  .replace('{branch-B}', options.args['branch-B']);
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
    case 'home':
      path = scheme.home;
      break;
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

module.exports.parse = parse;
module.exports.resolve = resolve;
