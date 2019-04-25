'use strict';

var gitresolve = require('../');
var gitremote = require('../lib/gitremote');
var child_process = require('child_process');
var should = require('should');

var cwb = gitremote.getCurrentBranch();
var RE_URL = /^https?:\/\//i;

describe('gitresolve.parse()', function() {
  var cases = [
    ['git@github.com:hotoo/gitopen.git', {hostname: 'github.com', username: 'hotoo', reponame: 'gitopen'}],
    ['git://github.com/hotoo/gitopen.git', {hostname: 'github.com', username: 'hotoo', reponame: 'gitopen'}],
    ['ssh://github.com/hotoo/gitopen.git', {hostname: 'github.com', username: 'hotoo', reponame: 'gitopen'}],
    ['ssh://hg@bitbucket.org/hotoo/gitopen.git', {hostname: 'bitbucket.org', username: 'hotoo', reponame: 'gitopen'}],
    ['https://github.com/hotoo/gitopen.git', {hostname: 'github.com', username: 'hotoo', reponame: 'gitopen'}],
    ['https://hotoo@bitbucket.org/hotoo/gitopen.git', {hostname: 'bitbucket.org', username: 'hotoo', reponame: 'gitopen'}],
  ];
  cases.forEach(function(test) {
    it('gitresolve.parse(' + test[0] + ')', function() {
      gitresolve.parse(test[0]).should.be.eql(test[1]);
    });
  });
});

describe('gitresolve.resolve()', function() {
  var cases = [
    ['git@github.com:hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['git://github.com/hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['ssh://github.com/hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['ssh://hg@bitbucket.org/hotoo/gitopen.git', 'bitbucket.org/hotoo/gitopen'],
    ['https://github.com/hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['https://hotoo@bitbucket.org/hotoo/gitopen.git', 'bitbucket.org/hotoo/gitopen'],
  ];
  cases.forEach(function(test) {
    it('gitresolve.resolve(' + test[0] + ',{base})', function() {
      gitresolve.resolve(test[0], {
        scheme: {base: '{protocol}://{hostname}/{username}/{reponame}'},
      }).should.be.eql('https://' + test[1]);
    });

    it('gitresolve.resolve(' + test[0] + ',{base,protocol})', function() {
      gitresolve.resolve(test[0], {
        protocol: 'http',
        scheme: {base: '{protocol}://{hostname}/{username}/{reponame}'},
      }).should.be.eql('http://' + test[1]);
    });
  });
});

describe('gitresolve()', function() {
  var cases = [
    ['git@github.com:hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['git://github.com/hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['ssh://github.com/hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['ssh://hg@bitbucket.org/hotoo/gitopen.git', 'bitbucket.org/hotoo/gitopen'],
    ['https://github.com/hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
    ['https://hotoo@bitbucket.org/hotoo/gitopen.git', 'bitbucket.org/hotoo/gitopen'],
  ];
  cases.forEach(function(test) {
    it('gitresolve(' + test[0] + ')', function() {
      gitresolve(test[0], {
        scheme: {base: '{protocol}://{hostname}/{username}/{reponame}'},
      }).should.be.eql('https://' + test[1]);
    });

    it('gitresolve.resolve(' + test[0] + ',{base,protocol})', function() {
      gitresolve(test[0], {
        protocol: 'http',
        scheme: {base: '{protocol}://{hostname}/{username}/{reponame}/something'},
      }).should.be.eql('http://' + test[1] + '/something');
    });

    it('gitresolve(' + test[0] + ', {issues})', function() {
      gitresolve(test[0], {
        category: 'issues',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          issues: '/issues',
        },
      }).should.be.eql('https://' + test[1] + '/issues');
    });

    it('gitresolve(' + test[0] + ', {issues/id})', function() {
      gitresolve(test[0], {
        category: 'issues/id',
        args: {'issue_id': '1'},
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'issues/id': '/issues/{issue-id}',
        },
      }).should.be.eql('https://' + test[1] + '/issues/1');
    });

    it('gitresolve(' + test[0] + ', {issues/new})', function() {
      gitresolve(test[0], {
        category: 'issues/new',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'issues/new': '/issues/new',
        },
      }).should.be.eql('https://' + test[1] + '/issues/new');
    });

    it('gitresolve(' + test[0] + ', {issues/new?title})', function() {
      gitresolve(test[0], {
        category: 'issues/new',
        args: {title: 'TEST'},
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'issues/new?title': '/issues/new?title={title}',
        },
      }).should.be.eql('https://' + test[1] + '/issues/new?title=TEST');
    });

    it('gitresolve(' + test[0] + ', {milestones})', function() {
      gitresolve(test[0], {
        category: 'milestones',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          milestones: '/milestones',
        },
      }).should.be.eql('https://' + test[1] + '/milestones');
    });

    it('gitresolve(' + test[0] + ', {milestones/id})', function() {
      gitresolve(test[0], {
        category: 'milestones/id',
        args: {'milestone_id': '1'},
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'milestones/id': '/milestones/{milestone-id}',
        },
      }).should.be.eql('https://' + test[1] + '/milestones/1');
    });

    it('gitresolve(' + test[0] + ', {milestones/new})', function() {
      gitresolve(test[0], {
        category: 'milestones/new',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'milestones/new': '/milestones/new',
        },
      }).should.be.eql('https://' + test[1] + '/milestones/new');
    });

    it('gitresolve(' + test[0] + ', {pulls})', function() {
      gitresolve(test[0], {
        category: 'pulls',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          pulls: '/pulls',
        },
      }).should.be.eql('https://' + test[1] + '/pulls');
    });

    it('gitresolve(' + test[0] + ', {pulls/id})', function() {
      gitresolve(test[0], {
        category: 'pulls/id',
        args: {'pull_id': '1'},
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'pulls/id': '/pull/{pull-id}',
        },
      }).should.be.eql('https://' + test[1] + '/pull/1');
    });

    it('gitresolve(' + test[0] + ', {pulls/new})', function() {
      gitresolve(test[0], {
        category: 'pulls/new',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'pulls/new': '/compare',
        },
      }).should.be.eql('https://' + test[1] + '/compare');
    });

    it('gitresolve(' + test[0] + ', {pulls/new})', function() {
      gitresolve(test[0], {
        category: 'pulls/new',
        args: {
          'branch-A': '123',
          'branch-B': '456',
        },
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'pulls/new-with-base-branch': '/compare/{branch-A}...{branch-B}',
        },
      }).should.be.eql('https://' + test[1] + '/compare/123...456');
    });

    it('gitresolve(' + test[0] + ', {pulls/new/branchName})', function() {
      gitresolve(test[0], {
        category: 'pulls/new',
        args: {
          'branch-B': '456',
        },
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'pulls/new-with-compare-branch': '/compare/{branch-B}?expand=1',
        },
      }).should.be.eql('https://' + test[1] + '/compare/456?expand=1');
    });

    it('gitresolve(' + test[0] + ', {wiki})', function() {
      gitresolve(test[0], {
        category: 'wiki',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          wiki: '/wiki',
        },
      }).should.be.eql('https://' + test[1] + '/wiki');
    });

    it('gitresolve(' + test[0] + ', {tags})', function() {
      gitresolve(test[0], {
        category: 'tags',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          tags: '/tags',
        },
      }).should.be.eql('https://' + test[1] + '/tags');
    });

    it('gitresolve(' + test[0] + ', {releases})', function() {
      gitresolve(test[0], {
        category: 'releases',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          releases: '/releases',
        },
      }).should.be.eql('https://' + test[1] + '/releases');
    });

    it('gitresolve(' + test[0] + ', {releases/new})', function() {
      gitresolve(test[0], {
        category: 'releases/new',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'releases/new': '/releases/new',
        },
      }).should.be.eql('https://' + test[1] + '/releases/new');
    });

    it('gitresolve(' + test[0] + ', {releases/new-with-tag})', function() {
      gitresolve(test[0], {
        category: 'releases/new-with-tag',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'releases/new-with-tag': '/releases/new?tag={tag}',
        },
        args: {tag: '2.0.0'},
      }).should.be.eql('https://' + test[1] + '/releases/new?tag=2.0.0');
    });

    it('gitresolve(' + test[0] + ', {releases/edit/tag-id})', function() {
      gitresolve(test[0], {
        category: 'releases/edit/tag-id',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'releases/edit/tag-id': '/releases/edit/{tag}',
        },
        args: {tag: '2.0.0'},
      }).should.be.eql('https://' + test[1] + '/releases/edit/2.0.0');
    });

    it('gitresolve(' + test[0] + ', {network})', function() {
      gitresolve(test[0], {
        category: 'network',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'network': '/network',
        },
      }).should.be.eql('https://' + test[1] + '/network');
    });

    it('gitresolve(' + test[0] + ', {commits})', function() {
      gitresolve(test[0], {
        category: 'commits',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'commits': '/commits',
        },
      }).should.be.eql('https://' + test[1] + '/commits');
    });

    it('gitresolve(' + test[0] + ', {commits-with-branch})', function() {
      gitresolve(test[0], {
        category: 'commits-with-branch',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'commits-with-branch': '/commits?branch={branch-name}',
        },
        branch: 'br',
      }).should.be.eql('https://' + test[1] + '/commits?branch=br');
    });

    it('gitresolve(' + test[0] + ', {branches})', function() {
      gitresolve(test[0], {
        category: 'branches',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'branches': '/branches',
        },
      }).should.be.eql('https://' + test[1] + '/branches');
    });

    it('gitresolve(' + test[0] + ', {home})', function() {
      gitresolve(test[0], {
        category: 'home',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'home': '',
        },
        args: {branch: 'br'},
      }).should.be.eql('https://' + test[1]);
    });

    it('gitresolve(' + test[0] + ', {tree})', function() {
      gitresolve(test[0], {
        category: 'tree',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'tree': '/tree/{hash}/',
        },
        hash: 'br',
        args: {path: ''},
      }).should.be.eql('https://' + test[1] + '/tree/br/');
    });

    it('gitresolve(' + test[0] + ', {blob})', function() {
      gitresolve(test[0], {
        category: 'blob',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'blob': '/blob/{hash}{path}',
        },
        hash: 'br',
        args: {path: '/README'},
      }).should.be.eql('https://' + test[1] + '/blob/br/README');
    });

    it('gitresolve(' + test[0] + ', {snippets/new})', function() {
      gitresolve(test[0], {
        category: 'snippets/new',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'snippets/new': '/snippets/new',
        },
      }).should.be.eql('https://' + test[1] + '/snippets/new');
    });

    it('gitresolve(' + test[0] + ', {commit:ed8d9e3})', function() {
      gitresolve(test[0], {
        category: 'commit',
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'commit': '/commits/{hash}',
        },
        hash: 'ed8d9e3',
      }).should.be.eql('https://' + test[1] + '/commits/ed8d9e3');
    });

  });
});

describe('gitremote()', function() {
  var RE_PROTOCOL = /^(?:\w+\:\/\/|\w+@)/;
  var RE_GIT_EXT = /\.git$/i;
  function resolve(uri) {
    return uri.replace(RE_PROTOCOL, '')
              .replace(':', '/')
              .replace(RE_GIT_EXT, '');
  }
  it('gitremote.getRemoteUrl()', function() {
    resolve(gitremote.getRemoteUrl()).should.be.eql('github.com/hotoo/gitopen');
  });

  it('gitremote.getRemoteUrl({cwd})', function() {
    resolve(gitremote.getRemoteUrl({cwd: '.'})).should.be.eql('github.com/hotoo/gitopen');
  });

  it('gitremote.getRemoteUrl({remote})', function(done) {
    resolve(gitremote.getRemoteUrl({remote: 'origin'})).should.be.eql('github.com/hotoo/gitopen');
    child_process.exec('git remote add gitlab git@gitlab.com:hotoo/gitopen.git', {cwd: '.'}, function(/* err, stdout */) {
      resolve(gitremote.getRemoteUrl({remote: 'gitlab'})).should.be.eql('gitlab.com/hotoo/gitopen');
      done();
    });
  });

  // git remote name
  it('gitremote.getRemoteName({remote: "test"})', function() {
    resolve(gitremote.getRemoteName({remote: 'test'})).should.be.eql('test');
  });

  it('gitremote.getRemoteName()', function() {
    resolve(gitremote.getRemoteName()).should.be.eql('origin');
  });
});

describe('$ cd non-git-dir && gitopen', function() {
  it('$ gitopen @hotoo', function(done) {
    child_process.exec('./gitopen/bin/gitopen --verbose @hotoo', {cwd: '..'}, function(err, stdout) {
      should(err).not.be.ok();
      stdout.should.be.containEql('URL: https://github.com/hotoo\n');
      done();
    });
  });

  it('$ gitopen @hotoo/gitopen', function(done) {
    child_process.exec('./gitopen/bin/gitopen --verbose @hotoo/gitopen', {cwd: '..'}, function(err, stdout) {
      should(err).not.be.ok();
      stdout.should.be.containEql('URL: https://github.com/hotoo/gitopen\n');
      done();
    });
  });

  it('$ gitopen snippet', function(done) {
    child_process.exec('./gitopen/bin/gitopen --verbose snippet', {cwd: '..'}, function(err, stdout) {
      should(err).not.be.ok();
      stdout.should.be.containEql('URL: https://gist.github.com/\n');
      done();
    });
  });

  it('$ gitopen #1    SHOULD ERROR', function(done) {
    child_process.exec('./gitopen/bin/gitopen --verbose "#1"', {cwd: '..'}, function(err) {
      should(err).be.ok();
      done();
    });
  });
});

describe('$ gitopen', function() {

  var git_command_case = [
    ['', '/hotoo/gitopen'],
    ['"#1"', '/hotoo/gitopen/issues/1'],
    [':master', '/hotoo/gitopen/tree/master'],
    [':master README.md', '/hotoo/gitopen/blob/master/README.md'],
    ['README.md :master', '/hotoo/gitopen/blob/master/README.md'],
    ['README.md', '/hotoo/gitopen/blob/' + cwb + '/README.md'],
    ['-p README.md', '/hotoo/gitopen/blob/' + cwb + '/README.md'],
    ['--path README.md', '/hotoo/gitopen/blob/' + cwb + '/README.md'],
    ['--path README.md :master', '/hotoo/gitopen/blob/master/README.md'],
    ['--path README.md -b master', '/hotoo/gitopen/blob/master/README.md'],
    ['lib', '/hotoo/gitopen/tree/' + cwb + '/lib'],
    [':master lib', '/hotoo/gitopen/tree/master/lib'],
    [':master lib/', '/hotoo/gitopen/tree/master/lib/'],
    ['lib :master', '/hotoo/gitopen/tree/master/lib'],
    ['-p lib :master', '/hotoo/gitopen/tree/master/lib'],
    ['--path lib :master', '/hotoo/gitopen/tree/master/lib'],
    ['--path lib -b master', '/hotoo/gitopen/tree/master/lib'],
    ['-b master', '/hotoo/gitopen/tree/master'],
    ['--branch master', '/hotoo/gitopen/tree/master'],
    ['wiki', '/hotoo/gitopen/wiki'],
    ['wikis', '/hotoo/gitopen/wiki'],
    ['issues', '/hotoo/gitopen/issues'],
    ['issue', '/hotoo/gitopen/issues/new'],
    ['issue TITLE', '/hotoo/gitopen/issues/new?title=TITLE'],
    ['issue 标题', '/hotoo/gitopen/issues/new?title=%E6%A0%87%E9%A2%98'],
    ['issue TITLE 标题', '/hotoo/gitopen/issues/new?title=TITLE%20%E6%A0%87%E9%A2%98'],
    ['milestones', '/hotoo/gitopen/milestones'],
    ['milestone', '/hotoo/gitopen/milestones/new'],
    ['milestone@2.0.0', '/hotoo/gitopen/issues?q=milestone%3A2.0.0'],
    ['milestone/2.0.0', '/hotoo/gitopen/issues?q=milestone%3A2.0.0'],
    ['milestone-2.0.0', '/hotoo/gitopen/issues?q=milestone%3A2.0.0'],
    ['milestone#2.0.0', '/hotoo/gitopen/issues?q=milestone%3A2.0.0'],
    ['milestone#里程碑', '/hotoo/gitopen/issues?q=milestone%3A%E9%87%8C%E7%A8%8B%E7%A2%91'],
    ['pr', '/hotoo/gitopen/compare/' + cwb + '?expand=1'],
    ['pull', '/hotoo/gitopen/compare/' + cwb + '?expand=1'],
    ['pr compare-branch', '/hotoo/gitopen/compare/compare-branch?expand=1'],
    ['pull compare-branch', '/hotoo/gitopen/compare/compare-branch?expand=1'],
    ['pr base-branch:compare-branch', '/hotoo/gitopen/compare/base-branch...compare-branch?expand=1'],
    ['pr base/branch:compare/branch', '/hotoo/gitopen/compare/base/branch...compare/branch?expand=1'],
    ['pr base-branch...compare-branch', '/hotoo/gitopen/compare/base-branch...compare-branch?expand=1'],
    ['pr base/branch...compare/branch', '/hotoo/gitopen/compare/base/branch...compare/branch?expand=1'],
    ['pr base/branch+name...compare/branch#name', '/hotoo/gitopen/compare/base/branch%2Bname...compare/branch%23name?expand=1'],
    ['pulls', '/hotoo/gitopen/pulls'],
    ['prs', '/hotoo/gitopen/pulls'],
    ['mrs', '/hotoo/gitopen/pulls'],
    ['pulls new', '/hotoo/gitopen/compare'],
    ['!1', '/hotoo/gitopen/pull/1'],
    ['pr1', '/hotoo/gitopen/pull/1'],
    ['pr:1', '/hotoo/gitopen/pull/1'],
    ['pr-1', '/hotoo/gitopen/pull/1'],
    ['pr/1', '/hotoo/gitopen/pull/1'],
    ['pr@1', '/hotoo/gitopen/pull/1'],
    ['mr1', '/hotoo/gitopen/pull/1'],
    ['mr:1', '/hotoo/gitopen/pull/1'],
    ['mr-1', '/hotoo/gitopen/pull/1'],
    ['mr/1', '/hotoo/gitopen/pull/1'],
    ['mr@1', '/hotoo/gitopen/pull/1'],
    ['ci', '/hotoo/gitopen/commits'],
    ['commit', '/hotoo/gitopen/commits'],
    ['commits', '/hotoo/gitopen/commits'],
    ['blame path/to/file', '/hotoo/gitopen/blame/' + cwb + '/path/to/file'],
    ['blame -b branch-name path/to/file', '/hotoo/gitopen/blame/branch-name/path/to/file'],
    ['ed8d9e3', '/hotoo/gitopen/commit/ed8d9e3'],
    ['brs', '/hotoo/gitopen/branches'],
    ['branches', '/hotoo/gitopen/branches'],
    ['@hotoo', '/hotoo'],
    ['@hotoo/gitopen', '/hotoo/gitopen'],
    ['snippet', 'https://gist.github.com/'],
    ['snip', 'https://gist.github.com/'],
    ['gist', 'https://gist.github.com/'],
  ];

  git_command_case.forEach(function(testcase) {
    var cmd = testcase[0] ? ' ' + testcase[0] : '';
    it('$ gitopen' + cmd, function(done) {
      child_process.exec('./bin/gitopen --verbose' + cmd, function(err, stdout) {
        should(err).not.be.ok();
        stdout.should.be.containEql('URL: ' + (RE_URL.test(testcase[1]) ? testcase[1] : 'https://github.com' + testcase[1]) + '\n');
        done();
      });
    });
  });

  var git_command_case_in_subdir = [
    ['../README.md :master', '/hotoo/gitopen/blob/master/README.md'],
    ['../README.md -b master', '/hotoo/gitopen/blob/master/README.md'],
    [':master ../lib', '/hotoo/gitopen/tree/master/lib'],
    ['-b master ../lib', '/hotoo/gitopen/tree/master/lib'],
  ];
  git_command_case_in_subdir.forEach(function(testcase) {
    var cmd = testcase[0] ? ' ' + testcase[0] : '';
    it('$ cd bin && gitopen' + cmd, function(done) {
      child_process.exec('./gitopen --verbose' + cmd, {cwd: './bin'}, function(err, stdout) {
        should(err).not.be.ok();
        stdout.should.be.containEql('URL: ' + (RE_URL.test(testcase[1]) ? testcase[1] : 'https://github.com' + testcase[1]) + '\n');
        done();
      });
    });
  });


  it('$ gitopen --remote gitlab', function(done) {
    child_process.exec('./bin/gitopen --verbose --remote gitlab', function(err, stdout) {
      should(err).not.be.ok();
      stdout.should.be.containEql('URL: https://gitlab.com/hotoo/gitopen\n');
      done();
    });
  });

  it('gitopen with .gitconfig setting gitopen.remote', function(done) {
    child_process.exec('git config gitopen.remote gitlab', {cwd: '.'}, function(err/* , stdout */) {
      should(err).not.be.ok();

      child_process.exec('./bin/gitopen --verbose', function(errOpen, stdoutOpen) {
        should(errOpen).not.be.ok();
        stdoutOpen.should.be.containEql('URL: https://gitlab.com/hotoo/gitopen\n');
        done();
      });
    });
  });
});


describe('$ hgopen', function() {
  var hg_command_case = [
    ['', '/hotoo/gitopen'],
    ['#1', '/hotoo/gitopen/issues/1'],
    ['snippet', 'https://bitbucket.org/snippets/new'],
    ['snip', 'https://bitbucket.org/snippets/new'],
    ['gist', 'https://bitbucket.org/snippets/new'],
  ];

  describe('$ ssh://', function() {
    hg_command_case.forEach(function(testcase) {
      var cmd = testcase[0] ? ' "' + testcase[0] + '"' : '';
      it('$ hgopen' + cmd, function(done) {
        child_process.exec('../../bin/hgopen --verbose' + cmd, {cwd: 'test/hgssh'}, function(err, stdout) {
          should(err).not.be.ok();
          stdout.should.be.containEql('URL: ' + (RE_URL.test(testcase[1]) ? testcase[1] : 'https://bitbucket.org' + testcase[1]) + '\n');
          done();
        });
      });
    });
  });

  describe('$ https://', function() {
    hg_command_case.forEach(function(testcase) {
      var cmd = testcase[0] ? ' "' + testcase[0] + '"' : '';
      it('$ hgopen' + cmd, function(done) {
        child_process.exec('../../bin/hgopen --verbose' + cmd, {cwd: 'test/hghttp'}, function(err, stdout) {
          should(err).not.be.ok();
          stdout.should.be.containEql('URL: ' + (RE_URL.test(testcase[1]) ? testcase[1] : 'https://bitbucket.org' + testcase[1]) + '\n');
          done();
        });
      });
    });
  });
});

describe('$ svnopen', function() {
  // TODO:
});
