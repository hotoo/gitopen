
var gitresolve = require('../');
var gitremote = require('../lib/gitremote');

describe('gitresolve.parse()', function () {
  var cases = [
    ['git@github.com:hotoo/gitopen.git', {hostname: 'github.com', username:'hotoo', reponame:'gitopen'}],
    ['git://github.com/hotoo/gitopen.git', {hostname: 'github.com', username:'hotoo', reponame:'gitopen'}],
    ['ssh://github.com/hotoo/gitopen.git', {hostname: 'github.com', username:'hotoo', reponame:'gitopen'}],
    ['https://github.com/hotoo/gitopen.git', {hostname: 'github.com', username:'hotoo', reponame:'gitopen'}],
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
    ['https://github.com/hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
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
    ['https://github.com/hotoo/gitopen.git', 'github.com/hotoo/gitopen'],
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

    it('gitresolve(' + test[0] + ', {pulls/new-with-branch})', function () {
      gitresolve(test[0], {
        category: 'pulls/new-with-branch',
        args: {
          'branch-A': '123',
          'branch-B': '456'
        },
        scheme: {
          base: '{protocol}://{hostname}/{username}/{reponame}',
          'pulls/new-with-branch': '/compare/{branch-A}...{branch-B}',
        }
      }).should.be.eql('https://' + test[1] + '/compare/123...456');
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

describe('gitopen()', function () {
  return;

  it('gitopen()', function () {
    gitremote().should.be.eql('https://github.com/hotoo/gitopen');
  });

  it('gitopen(cwd)', function () {
    gitremote({cwd:'.'}).should.be.eql('https://github.com/hotoo/gitopen');
  });

  it('gitopen(remote)', function () {
    gitremote({remote:'origin'}).should.be.eql('https://github.com/hotoo/gitopen');
  });

  it('gitopen(hash)', function () {
    gitremote({hash:'012345'}).should.be.eql('https://github.com/hotoo/gitopen/tree/012345');
  });

});
