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

  // get config from ~/.gitopenrc
  var gitopenConfig = {};
  var gitopenrc = path.join($HOME, '.gitopenrc');
  if (fs.existsSync(gitopenrc)) {
    try {
      config = yaml.load(fs.readFileSync(gitopenrc, 'utf8'));
      Object.keys(config).some(function(hostname) {
        if (HOSTNAME === hostname) {
          gitopenConfig.protocol = config[hostname].protocol || 'https';
          var type = config[hostname].type;
          // oschina 更名为 gitee，做兼容，用户可以保持配置为 oschina
          if (type === 'oschina') {
            type = 'gitee';
            console.warn('The type of "oschina" is deprecated, please use "gitee" in ~/.gitopenrc file.');
          } else if (type === 'csdn') {
            type = 'gitcode';
            console.warn('The type of "csdn" is deprecated, please use "gitcode" in ~/.gitopenrc file.');
          }
          gitopenConfig.type = type;
          if (type === 'custom') {
            // 完全自定义类型的 gitopen
            gitopenConfig.scheme = config[hostname].scheme || {};
          } else {
            // 内置类型的 gitopen 配置，但是可以覆盖部分 scheme 配置。
            var gitopenConfigScheme = require('../lib/scheme/' + type);
            gitopenConfig.scheme = merge(merge({}, gitopenConfigScheme), config[hostname].scheme);
          }
          return true;
        }
        return false;
      });
    } catch (ex) {
      console.error('Read %s error: %s', gitopenrc, ex.message);
      return process.exit(1);
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
  var type = gitConfig.type;
  if (type && type !== 'custom') {
    // oschina 更名为 gitee，做兼容，用户可以保持配置为 oschina
    if (type === 'oschina') {
      type = 'gitee';
      console.warn('The type of "oschina" is deprecated, please use "gitee" in git config.');
      console.warn('Try to execute command "git config gitopen.type gitee" in terminal.');
    } else if (type === 'csdn') {
      type = 'gitcode';
      console.warn('The type of "csdn" is deprecated, please use "gitcode" in git config.');
      console.warn('Try to execute command "git config gitopen.type gitcode" in terminal.');
    }
    gitConfig.scheme = require('../lib/scheme/' + type);
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
