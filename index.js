
var child_process = require('child_process');

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

var RE_SCP_URL = /^git@/i;
var RE_GIT_URL = /^git:\/\//i;
var RE_SSH_URL = /^ssh:\/\//i;
var RE_HTTP_URL = /^https?:\/\//i;
var RE_FILE_URL = /^file:\/\/\//i;
var RE_GIT_EXT = /\.git$/i;
function resolveGitUrl(uri) {
  switch(true){
  case RE_SCP_URL.test(uri):
    return 'https://' + (uri.replace(RE_SCP_URL, '')
              .replace(':', '/')
              .replace(RE_GIT_EXT, ''));
  case RE_GIT_URL.test(uri):
    return uri.replace(RE_GIT_URL, 'https://')
              .replace(RE_GIT_EXT, '');
  case RE_SSH_URL.test(uri):
    return uri.replace(RE_SSH_URL, 'https://')
              .replace(RE_GIT_EXT, '');
  case RE_HTTP_URL.test(uri):
    return uri.replace(RE_GIT_EXT, '');
  case RE_FILE_URL.test(uri):
    return uri;
  default:
    throw new Error('Not Support protocol: ' + uri);
  }
}

/* global module, process */
module.exports = function(options) {
  var cwd = options.cwd || process.cwd();
  var remote = getRemoteUrl(cwd, 'origin');
  var url = resolveGitUrl(remote);
  if (options.branch) {
    url += '/tree/' + options.branch;
  }
  if (options.path) {
    url += options.path;
  }
  return url;
};
