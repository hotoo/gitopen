module.exports = {
  'base': '{protocol}://{hostname}/{username}/{reponame}',
  'home': '',
  'issues': '/tickets',
  'issues/id': '/tickets/{issue-id}',
  'issues/new': '/tickets#new-issue',
  'issues/new?title': '/issues#new-issue?title={title}',
  'wiki': '/wiki',
  'network': '/graphs/master',
  'tree': '/tree/{hash}{path}',
  'blob': '/blob/{hash}{path}',
  'commit': '/commit/{hash}',
  'commits': '/commits/master',
  'commits-with-branch': '/commits/{branch-name}',
  'milestones': '', // NOT SUPPORT.
  'milestones/new': '', // NOT SUPPORT.
  'milestones/id': '', // NOT SUPPORT.
  'tags': '/tags',
  'releases': '/releases',
  'releases/new': '/releases/new',
  'releases/new-with-tag': '/releases/new?tag={tag}',
  'releases/edit/tag-id': '/releases/edit/{tag}',
  'pulls': '/pull',
  'pulls/id': '/pull/{pull-id}',
  'pulls/new': '/pull/new',
  'pulls/new-with-compare-branch': '/pull/new#{branch-B}',
  'pulls/new-with-base-branch': '/pull/new#{branch-A}...{branch-B}',
  'snippets/new': 'https://gist.github.com/',
};
