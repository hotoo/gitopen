
var gitresolve = require('../');
var gitremote = require('../lib/gitremote');
var child_process = require('child_process');
var should = require('should');

var cwb = gitremote.getCurrentBranch();

describe('gitresolve.parse()', function () {
  var cases = [
    ['git@github.com:hotoo/gitopen.git', {hostname: 'github.com', username:'hotoo', reponame:'gitopen'}],
    ['git://github.com/hotoo/gitopen.git', {hostname: 'github.com', username:'hotoo', reponame:'gitopen'}],
    ['ssh://github.com/hotoo/gitopen.git', {hostname: 'github.com', username:'hotoo', reponame:'gitopen'}],
    ['ssh://hg@bitbucket.org/hotoo/gitopen.git', {hostname: 'bitbucket.org', username:'hotoo', reponame:'gitopen'}],
    ['https://github.com/hotoo/gitopen.git', {hostname: 'github.com', username:'hotoo', reponame:'gitopen'}],
    ['https://hotoo@bitbucket.org/hotoo/gitopen.git', {hostname: 'bitbucket.org', username:'hotoo', reponame:'gitopen'}],
  ];
  cases.forEach(function(test){
    it('gitresolve.parse(' + test[0] + ')', function () {
      gitresolve.parse(test[0]).should.be.eql(test[1]);
    });
  });
});

describe('gitresolve.resolve()', function () {
  var cases = [
    ['git@github.com:hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['git://github.com/hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['ssh://github.com/hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['ssh://hg@bitbucket.org/hotoo/gitopen.git', 'bitbucket.org/hotoo/gitopen'],
    ['https://github.com/hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['https://hotoo@bitbucket.org/hotoo/gitopen.git', 'bitbucket.org/hotoo/gitopen'],
  ];
  cases.forEach(function(test){
    it('gitresolve.resolve(' + test[0] + ',{base})', function () {
      gitresolve.resolve(test[0], {
        scheme: {base: '{protocol}://{hostname}/{username}/{reponame}'}
      }).should.be.eql('https://' + test[1]);
    });

    it('gitresolve.resolve(' + test[0] + ',{base,protocol})', function () {
      gitresolve.resolve(test[0], {
        protocol: 'http',
        scheme: {base: '{protocol}://{hostname}/{username}/{reponame}'}
      }).should.be.eql('http://' + test[1]);
    });
  });
});

describe('gitresolve()', function () {
  var cases = [
    ['git@github.com:hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['git://github.com/hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['ssh://github.com/hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['ssh://hg@bitbucket.org/hotoo/gitopen.git', 'bitbucket.org/hotoo/gitopen'],
    ['https://github.com/hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['https://hotoo@bitbucket.org/hotoo/gitopen.git', 'bitbucket.org/hotoo/gitopen'],
  ];
  cases.forEach(function(test){
    it('gitresolve(' + test[0] + ')', function () {
      gitresolve(test[0], {
        scheme: {base: '{protocol}://{hostname}/{username}/{reponame}'}
      }).should.be.eql('https://' + test[1]);
    });

    it('gitresolve.resolve(' + test[0] + ',{base,protocol})', function () {
      gitresolve(test[0], {
        protocol: 'http',
        scheme: {base: '{protocol}://{hostname}/{username}/{reponame}/something'}
      }).should.be.eql('http://' + test[1] + '/something');
    });

    it('gitresolve(' + test[0] + ', {issues})', function () {
      gitresolve(test[0], {
        category: 'issues',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          issues: '/issues',
        }
      }).should.be.eql('https://' + test[1] + '/issues');
    });

    it('gitresolve(' + test[0] + ', {issues/id})', function () {
      gitresolve(test[0], {
        category: 'issues/id',
        args: {'issue_id': '1'},
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'issues/id': '/issues/{issue-id}',
        }
      }).should.be.eql('https://' + test[1] + '/issues/1');
    });

    it('gitresolve(' + test[0] + ', {issues/new})', function () {
      gitresolve(test[0], {
        category: 'issues/new',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'issues/new': '/issues/new',
        }
      }).should.be.eql('https://' + test[1] + '/issues/new');
    });

    it('gitresolve(' + test[0] + ', {issues/new?title})', function () {
      gitresolve(test[0], {
        category: 'issues/new-with-title',
        args: {title: 'TEST'},
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'issues/new?title': '/issues/new?title={title}',
        }
      }).should.be.eql('https://' + test[1] + '/issues/new?title=TEST');
    });

    it('gitresolve(' + test[0] + ', {issues/new?title})', function () {
      gitresolve(test[0], {
        category: 'pulls',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          pulls: '/pulls',
        }
      }).should.be.eql('https://' + test[1] + '/pulls');
    });

    it('gitresolve(' + test[0] + ', {pulls/new})', function () {
      gitresolve(test[0], {
        category: 'pulls/new',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'pulls/new': '/compare',
        }
      }).should.be.eql('https://' + test[1] + '/compare');
    });

    it('gitresolve(' + test[0] + ', {pulls/new})', function () {
      gitresolve(test[0], {
        category: 'pulls/new',
        args: {
          'branch-A': '123',
          'branch-B': '456'
        },
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'pulls/new-with-base-branch': '/compare/{branch-A}...{branch-B}',
        }
      }).should.be.eql('https://' + test[1] + '/compare/123...456');
    });

    it('gitresolve(' + test[0] + ', {pulls/new/branchName})', function () {
      gitresolve(test[0], {
        category: 'pulls/new',
        args: {
          'branch-B': '456'
        },
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'pulls/new-with-compare-branch': '/compare/{branch-B}?expand=1',
        }
      }).should.be.eql('https://' + test[1] + '/compare/456?expand=1');
    });

  });
});

describe('gitremote()', function () {
  var RE_PROTOCOL = /^(?:\w+\:\/\/|\w+@)/;
  var RE_GIT_EXT = /\.git$/i;
  function resolve(uri) {
    return uri.replace(RE_PROTOCOL, '')
              .replace(':', '/')
              .replace(RE_GIT_EXT, '');
  }
  it('gitremote.getRemoteUrl()', function () {
    resolve(gitremote.getRemoteUrl()).should.be.eql('github.com/hotoo/gitopen');
  });

  it('gitremote.getRemoteUrl({cwd})', function () {
    resolve(gitremote.getRemoteUrl({cwd:'.'})).should.be.eql('github.com/hotoo/gitopen');
  });

  it('gitremote.getRemoteUrl({remote})', function () {
    resolve(gitremote.getRemoteUrl({remote:'origin'})).should.be.eql('github.com/hotoo/gitopen');
  });

});

describe('$ cd non-git-dir && gitopen', function () {
  it('$ gitopen @hotoo', function (done) {
    child_process.exec('cd .. && ./gitopen/bin/gitopen --verbose @hotoo', function(err, stdout) {
      should(err).not.be.ok();
      stdout.should.be.containEql('URL: https://github.com/hotoo\n');
      done();
    });
  });

  it('$ gitopen @hotoo/gitopen', function (done) {
    child_process.exec('cd .. && ./gitopen/bin/gitopen --verbose @hotoo/gitopen', function(err, stdout) {
      should(err).not.be.ok();
      stdout.should.be.containEql('URL: https://github.com/hotoo/gitopen\n');
      done();
    });
  });

  it('$ gitopen #1    SHOULD ERROR', function (done) {
    child_process.exec('cd .. && ./gitopen/bin/gitopen --verbose "#1"', function(err) {
      should(err).be.ok();
      done();
    });
  });
});

describe('$ gitopen', function () {

  var git_command_case = [
    ['', '/hotoo/gitopen'],
    ['"#1"', '/hotoo/gitopen/issues/1'],
    [':master', '/hotoo/gitopen/tree/master'],
    ['-b master', '/hotoo/gitopen/tree/master'],
    ['--branch master', '/hotoo/gitopen/tree/master'],
    ['wiki', '/hotoo/gitopen/wiki'],
    ['wikis', '/hotoo/gitopen/wiki'],
    ['issues', '/hotoo/gitopen/issues'],
    ['issue', '/hotoo/gitopen/issues'],
    ['pr', '/hotoo/gitopen/compare/' + cwb + '?expand=1'],
    ['pull', '/hotoo/gitopen/compare/' + cwb + '?expand=1'],
    ['pr compare-branch', '/hotoo/gitopen/compare/compare-branch?expand=1'],
    ['pull compare-branch', '/hotoo/gitopen/compare/compare-branch?expand=1'],
    ['pr base-branch:compare-branch', '/hotoo/gitopen/compare/base-branch...compare-branch'],
    ['pr base/branch:compare/branch', '/hotoo/gitopen/compare/base/branch...compare/branch'],
    ['pr base-branch...compare-branch', '/hotoo/gitopen/compare/base-branch...compare-branch'],
    ['pr base/branch...compare/branch', '/hotoo/gitopen/compare/base/branch...compare/branch'],
    ['pulls', '/hotoo/gitopen/pulls'],
    ['pulls new', '/hotoo/gitopen/compare'],
    ['ci', '/hotoo/gitopen/commits'],
    ['commit', '/hotoo/gitopen/commits'],
    ['commits', '/hotoo/gitopen/commits'],
    ['@hotoo', '/hotoo'],
    ['@hotoo/gitopen', '/hotoo/gitopen'],
  ];

  git_command_case.forEach(function(testcase) {
    var cmd = testcase[0] ? ' ' + testcase[0] : '';
    it('$ gitopen' + cmd, function (done) {
      child_process.exec('bin/gitopen --verbose' + cmd, function(err, stdout) {
        should(err).not.be.ok();
        stdout.should.be.containEql('URL: https://github.com' + testcase[1] + '\n');
        done();
      });
    });
  });
});


describe('$ hgopen', function () {
  var hg_command_case = [
    ['', '/hotoo/hgtest'],
    ['#1', '/hotoo/hgtest/issues/1'],
  ];

  describe('$ ssh://', function () {
    hg_command_case.forEach(function(testcase) {
      var cmd = testcase[0] ? ' "' + testcase[0] + '"' : '';
      it('$ hgopen' + cmd, function (done) {
        child_process.exec('cd test/hgssh && ../../bin/hgopen --verbose' + cmd, function(err, stdout) {
          should(err).not.be.ok();
          stdout.should.be.containEql('URL: https://bitbucket.org' + testcase[1] + '\n');
          done();
        });
      });
    });
  });

  describe('$ https://', function () {
    hg_command_case.forEach(function(testcase) {
      var cmd = testcase[0] ? ' "' + testcase[0] + '"' : '';
      it('$ hgopen' + cmd, function (done) {
        child_process.exec('cd test/hghttp && ../../bin/hgopen --verbose' + cmd, function(err, stdout) {
          should(err).not.be.ok();
          stdout.should.be.containEql('URL: https://bitbucket.org' + testcase[1] + '\n');
          done();
        });
      });
    });
  });
});

describe('$ svnopen', function () {
  // TODO:
});
