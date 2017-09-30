'use strict';
/* global module */

var merge = require('deepmerge');
var gitremote = require('./gitremote');

var DEFAULT_OPTIONS = {
  hash: 'master',
  protocol: 'https',
  remote: 'origin',
  scheme: {
    base: '{protocol}://{hostname}/{username}/{reponame}',
  },
};

var RE_URL = /^https?:\/\//i;
//                 git@hostname:username/reponame.git
var RE_SCP_URL = /^git@([^:]+):([^\/]+)\/(.+?)(?:\.git)?$/i;
//                 git://hostname/username/reponame.git
var RE_GIT_URL = /^git:\/\/([^\/]+)\/([^\/]+)\/(.+?)(?:\.git)?$/i;
//                 ssh://hostname/username/reponame.git
//                 ssh://hg@hostname/username/reponame.git
var RE_SSH_URL = /^ssh:\/\/(?:[^@]+@)?([^\/]+)\/([^\/]+)\/(.+?)(?:\.git)?$/i;
//                  https://hostname/username/reponame.git
//                  https://hg@hostname/username/reponame.git
var RE_HTTP_URL = /^https?:\/\/(?:[a-z0-9-_.]+@)?([^\/]+)\/([^\/]+)\/(.+?)(?:\.git)?$/i;

// Parse git remote url,hg paths, or svn url.
// @param {String} uri:
//
//    ssh://github.com/hotoo/gitopen
//    git://github.com/hotoo/gitopen
//    git@github.com:hotoo/gitopen
//    ...
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
    if (options.args && options.args.title) {
      path = scheme['issues/new?title'].replace('{title}', encodeURIComponent(options.args.title));
    } else {
      path = scheme['issues/new'];
    }
    break;
  case 'mrs':
  case 'prs':
  case 'pulls':
    path = scheme.pulls;
    break;
  case 'pulls/new':
    if (options.args) {
      var branchA = gitremote.encodeBranchName(options.args['branch-A']);
      var branchB = gitremote.encodeBranchName(options.args['branch-B']);
      if (options.args['branch-A']) {
        path = scheme['pulls/new-with-base-branch']
                    .replace('{branch-A}', branchA)
                    .replace('{branch-B}', branchB);
      } else if (options.args['branch-B']) {
        path = scheme['pulls/new-with-compare-branch']
                    .replace('{branch-A}', branchA)
                    .replace('{branch-B}', branchB);
      }
    } else {
      path = scheme['pulls/new'];
    }
    break;
  case 'pulls/id':
    path = scheme['pulls/id']
            .replace('{pull-id}', options.args.pull_id);
    break;
  case 'wiki':
    path = scheme.wiki;
    break;
  case 'milestones/new':
    path = scheme['milestones/new'];
    break;
  case 'milestones/id':
    path = scheme['milestones/id'].replace('{milestone-id}', encodeURIComponent(options.args.milestone_id));
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
  case 'commit':
    path = scheme['commit']
                .replace('{hash}', options.hash);
    break;
  case 'commits':
    path = scheme.commits;
    if (options.type === 'gitlab') {
      path = scheme['commits-with-branch']
        .replace('{branch-name}', gitremote.encodeBranchName(options.cwb || options.hash));
    }
    break;
  case 'commits-with-branch':
    path = scheme['commits-with-branch']
                .replace('{branch-name}', gitremote.encodeBranchName(options.branch));
    break;
  case 'blame':
    path = scheme.blame.replace('{branch-name}', options.branch)
                       .replace('{path}', options.args.path);
    break;
  case 'brs':
  case 'branchs':
  case 'branches':
    path = scheme['branches'];
    break;
  case 'tree':
    path = scheme.tree.replace(/\{hash\}/g, options.hash)
                      .replace('{path}', options.args.path);
    break;
  case 'blob':
    path = scheme.blob.replace(/\{hash\}/g, options.hash)
                      .replace('{path}', options.args.path);
    break;
  case 'home':
    path = scheme.home;
    break;
  case 'snippets/new':
    var snippets_uri = parse(uri, options);
    path = scheme['snippets/new'].replace('{protocol}', snippets_uri.protocol || options.protocol || 'https')
                                 .replace('{hostname}', snippets_uri.hostname);
    break;
  default:
    path = '';
    if (options.hash !== 'master') {
      path = scheme.tree.replace('{hash}', options.hash);
    }
    break;
  }
  // if (options.path) {
    // path += options.path;
  // }
  return RE_URL.test(path) ? path : url + path;
};

module.exports.parse = parse;
module.exports.resolve = resolve;
