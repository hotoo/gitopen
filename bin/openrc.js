'use strict';

var fs = require('fs');
var merge = require('deepmerge');
var path = require('path');
var child_process = require('child_process');
var yaml = require('js-yaml');
var gitresolve = require('../lib/index');
var DEFAULT_CONFIG = require('../lib/gitopenrc');

function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

var $HOME = getUserHome();

/**
 * 获取 gitopen 配置。
 * @param {String} uri Git remote 地址。
 * @param {Object} options gitopen 传入的配置，例如当前目录 cwd。
 * @return {Object} 返回 gitopen 配置信息。
 */
function openrc(uri, options) {
  var HOSTNAME = gitresolve.parse(uri).hostname;
  var config = DEFAULT_CONFIG[HOSTNAME];

  // 命中内置的 gitopenrc 中对应域名的配置，直接返回。
  if (config) {
    return {
      type: config.type,
      scheme: require('../lib/scheme/' + DEFAULT_CONFIG[HOSTNAME].type),
      protocol: config.protocol,
    };
  }

  // get config from ~.gitopenrc
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
            // 完全自定义类型的 gitopen
            gitopenConfig.scheme = config[hostname].scheme || {};
          } else {
            // 内置类型的 gitopen 配置，但是可以覆盖部分 scheme 配置。
            const gitopenConfigScheme = require('../lib/scheme/' + config[hostname].type);
            gitopenConfig.scheme = merge(merge({}, gitopenConfigScheme), config[hostname].scheme);
          }
          return true;
        }
        return false;
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
  try {
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
  } catch (ex) { /* */ }

  // parse config from local repo .gitconfig
  try {
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
  } catch (ex) { /* */ }

  // 当 .gitopenrc 中定义为 type=custom，.gitconfig 中定义 type!=custom 时，
  // 将 schema 改回 .gitconfig 中定义的 scheme 配置。
  if (gitConfig.type && gitConfig.type !== 'custom') {
    gitConfig.scheme = require('../lib/scheme/' + gitConfig.type);
  }

  // 优先使用 gitopenConfig 的配置。
  const mergeConfig = merge(merge({}, gitConfig), gitopenConfig);

  if (!mergeConfig.type) {
    console.error('Not found gitopen configs.');
    console.error('Please read [Configuration](https://github.com/hotoo/gitopen#configuration) for more information.');
    process.exit(1);
  }

  return mergeConfig;
}

module.exports = openrc;
