
# gitopen

[![NPM version][npm-badge]][npm-url]
[![Build status][travis-badge]][travis-url]
[![Coveralls status][Coveralls-badge]][coveralls-url]

[npm-badge]: https://img.shields.io/npm/v/gitopen.svg?style=flat
[npm-url]: https://www.npmjs.com/package/gitopen
[travis-badge]: https://travis-ci.org/hotoo/gitopen.svg
[travis-url]: https://travis-ci.org/hotoo/gitopen
[coveralls-badge]: https://coveralls.io/repos/hotoo/gitopen/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/r/hotoo/gitopen

Open git remote from browser.

Support:

* Mac OS X
* Windows
* Linux/Unix

,

* [X] git
* [X] svn
* [X] hg

and

* [GitHub](https://github.com/)
* [GitLab](https://gitlub.com/)
* [BitBucket](https://bitbucket.org/)
* [GitCafe](https://gitcafe.com/)
* [OSC](https://git.oschina.net/)
* [Coding](https://coding.net/)
* Custom

## Install

```
$ npm install -g gitopen
```

## Usage

```
$ git remote -v
origin	git@github.com:hotoo/gitopen.git (fetch)
origin	git@github.com:hotoo/gitopen.git (push)
$ git branch
* master
$ cd subdir

$ gitopen                       # Open git repository homepage, like: https://github.com/hotoo/gitopen
$ gitopen :master               # Open git repository on given branch name.
$ gitopen -b master             # Same the `:master`
$ gitopen issues                # https://github.com/hotoo/gitopen/issues
$ gitopen #1                    # https://github.com/hotoo/gitopen/issues/1
$ gitopen pr                    # New a pull-request
$ gitopen !1                    # Open merge/pull request by id.
$ gitopen pulls                 # https://github.com/hotoo/gitopen/pulls
$ gitopen wiki                  # Open wiki pages.
$ gitopen release               # Open releases page.
$ gitopen tags                  # Open tags page.
$ gitopen commits               # Open commits pages.

# global command.
$ gitopen @lizzie               # https://github.com/lizzie
$ gitopen @hotoo/gitopen        # https://github.com/hotoo/gitopen
```

## Configuration

Default support [github.com](https://github.com/),
[bitbucket.org](https://bitbucket.org/), [gitlab.com](https://gitlab.com/),
[gitcafe.com](https://gitcafe.com/), [git.oschina.net](https://git.oschina.net/)
and [coding.net](https://coding.net/).

If you use [GitHub Enterprise](https://enterprise.github.com/),
[GitLab Community Edition (CE), GitLab Enterprise Edition (EE)](https://gitlab.org/),
[GitCafe Enterprise](https://enterprise.gitcafe.com/)
or other custom web system build you owner git server, you need config like:

~/.gitopenrc

```yaml
github.company.com:
  type: github
  protocol: https
gitlab.company.net:
  type: gitlab
  protocol: http
git.example.com:
  type: custom
  protocol: http
  scheme:
    issues: /path/to/issues
    wiki: /path/to/wikis
    more: [reference to github scheme](./lib/scheme/github.js)
    ...
```

You can git alias in ~/.gitconfig:

```
[alias]
  open = !gitopen $@
```

Then you can use command like:

```
$ git open
```

## gitopen Commands

### $ gitopen

Open git repository homepage.

### $ gitopen issues

Open git repository issues list page.

### $ gitopen issue [title]

Open new issue with title (optional).

### $ gitopen #1

Open git repository issue by id.

### $ gitopen pulls

Open git repository pulls list page.

### $ gitopen pull [branch-name]

Open pull request or merge request from given branch or current working branch
for git repository.

alias:

* `$ gitopen pr`
* `$ gitopen mr`

for example:

```
$ gitopen pr        # current working branch to compare default branch.
$ gitopen pr a      # given branch(a) to compare default branch.
$ gitopen pr a b    # branch b to compare branch a.
$ gitopen pr a...b  # branch b to compare branch a.
```

### $ gitopen !1

Open git repository pull request or merge request by id.

alias:

* `$ gitopen pr1`
* `$ gitopen mr#1`

support `@`, `/`, `#`, `:`, `-` or without sparator.

### $ gitopen commits

Open git repository commits list page.

alias:

* `$ gitopen commit`
* `$ gitopen ci`

### $ gitopen wiki

Open git repository wiki home page.

alias:

* `$ gitopen wikis`

### $ gitopen tags

Open git repository tags list page.

alias:

* `$ gitopen tag`

### $ gitopen milestones

Open git repository milestones list page.

### $ gitopen milestones@id

Open git repository milestones by given id.

alias:

* `$ gitopen milestone@id`

support `@`, `/`, `#`, `:`, `-` sparator.

### $ gitopen milestone

Open new milestone for git.

### $ gitopen releases

Open git repository releases list page.

alias:

* `$ gitopen release`

### $ gitopen release new [tag-name]

Open new release by tag name.

### $ gitopen release edit <tag-name>

Edit release by tag name.

### $ gitopen network

Open network page.

### $ gitopen @profile

[GLOBAL COMMAND] Open profile page on GitHub.

### $ gitopen @profile/repository-name

[GLOBAL COMMAND] Open given repository homepage on GitHub.

## hgopen Commands

Support all of gitopen in repository local commands (not support global commands), like:

* `$ hgopen` open homepage.
* `$ hgopen issues` open issues list page.
* `$ hgopen #id` op issues by id.
* ...

## svnopen Commands

### $ svnopen

Open svn repository on current working directory.

## License

[MIT](http://hotoo.mit-license.org/)
