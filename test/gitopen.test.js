
var gitremote = require('../');

describe('gitopen()', function () {

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
