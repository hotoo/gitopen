'use strict';
/* global process, module */

var fs = require('fs');
var path = require('path');
var child_process = require('child_process');
var yaml = require('js-yaml');
var gitresolve = require('../lib/index');
var DEFAULT_CONFIG = require('../lib/gitopenrc');

function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

var $HOME = getUserHome();

function openrc(uri, options) {
  var HOSTNAME = gitresolve.parse(uri).hostname;
  var config = DEFAULT_CONFIG[HOSTNAME];

  if (config) {
    return {
      type: config.type,
      scheme: require('../lib/scheme/' + DEFAULT_CONFIG[HOSTNAME].type),
      protocol: config.protocol,
    };
  }

  // get config from .gitopenrc
  var gitopenConfig = {};
  var gitopenrc = path.join($HOME, '.gitopenrc');
  if (fs.existsSync(gitopenrc)) {
    try {
      config = yaml.safeLoad(fs.readFileSync(gitopenrc, 'utf8'));
      Object.keys(config).some(function(hostname) {
        if (HOSTNAME === hostname) {
          gitopenConfig.protocol = config[hostname].protocol || 'https';
          gitopenConfig.type = config[hostname].type;
          var type = config[hostname].type;
          if (type === 'custom') {
            gitopenConfig.scheme = config[hostname].scheme || {};
          } else {
            gitopenConfig.scheme = require('../lib/scheme/' + config[hostname].type);
          }
          return true;
        }
      });
    } catch (ex) {
      console.error('Read %s error: %s', gitopenrc, ex.message);
      process.exit(1);
      return {};
    }
  }

  let gitConfig = {};
  var cwd = options.cwd || process.cwd();

  // parse config from global .gitconfig
  child_process.execSync(
    'git config --list --global | grep "^gitopen\\.' + HOSTNAME.replace(/\./g, '\\.') + '\\."',
    {cwd: cwd}
  ).toString().trim().split(/\r\n|\r|\n/).forEach(item => {
    var kv = item.split('=');
    if (kv.length < 2) { return; }
    var key = kv.shift().trim().replace('gitopen.' + HOSTNAME + '.', '');
    var val = kv.join('=').trim();
    gitConfig[key] = val;
  });

  // parse config from local repo .gitconfig
  child_process.execSync(
    'git config --list --local | grep "^gitopen\\."',
    {cwd: cwd}
  ).toString().trim().split(/\r\n|\r|\n/).forEach(item => {
    var kv = item.split('=');
    if (kv.length < 2) { return; }
    var key = kv.shift().trim().replace(/^gitopen\./, '');
    var val = kv.join('=').trim();
    gitConfig[key] = val;
  });

  // 当 .gitopenrc 中定义为 type=custom，.gitconfig 中定义 type!=custom 时，
  // 将 schema 改回 .gitconfig 中定义的 scheme 配置。
  if (gitConfig.type && gitConfig.type !== 'custom') {
    gitConfig.scheme = require('../lib/scheme/' + gitConfig.type);
  }

  // 优先使用 gitconfig 的配置。
  const mergeConfig = Object.assign({}, gitopenConfig, gitConfig);

  if (!mergeConfig.type) {
    console.error('Not found gitopen configs.');
    console.error('Please read [Configuration](https://github.com/hotoo/gitopen#configuration) for more information.');
    process.exit(1);
  }

  return mergeConfig;
}

module.exports = openrc;
