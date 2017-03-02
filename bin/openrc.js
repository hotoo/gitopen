'use strict';
/* global process, module */

var fs = require('fs');
var path = require('path');
var yaml = require('js-yaml');
var gitresolve = require('../lib/index');
var DEFAULT_CONFIG = require('../lib/gitopenrc');

function getUserHome() {
  return process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];
}

var $HOME = getUserHome();

function openrc(uri) {
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
      Object.keys(config).some(function(hostname) {
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
      console.error('Read %s error: %s', gitopenrc, ex.message);
      process.exit(1);
      return {};
    }
  } else {
    console.error('Not found gitopenrc file: %s', gitopenrc);
    console.error('Please read [Configuration](https://github.com/hotoo/gitopen#configuration) for more information.');
    process.exit(1);
    return {};
  }
}

module.exports = openrc;
