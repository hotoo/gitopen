/* global module */
module.exports = {
  'base': '{protocol}://{hostname}/{username}/{reponame}',
  'home': '',
  'issues': '/issues',
  'issues/id': '/issues/{issue-id}',
  'issues/new': '/issues/new',
  'issues/new?title': '/issues/new?title={title}',
  'wiki': '/wiki',
  'network': '/network',
  'tree': '/src/{hash}',
  'blob': '/src/{hash}',
  'commits': '/commits',
  'commits-with-branch': '/commits/{branch-name}',
  'milestones': '/milestones',
  'tags': '/tags',
  'releases': '/releases',
  'releases/new': '/releases/new',
  'releases/new-with-tag': '/releases/new?tag={tag}',
  'releases/edit/tag-id': '/releases/edit/{tag}',
  'pulls': '/pull-requests',
  'pulls/new': 'pull-request/new',
  'pulls/new-with-branch': '/pull-request/new/{branch-A}...{branch-B}', // FIXME
};
