
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
* [ ] hg

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

$ gitopen                           # https://github.com/hotoo/gitopen
$ gitopen :master
$ gitopen -b master
$ gitopen issues                # https://github.com/hotoo/gitopen/issues
$ gitopen #1                    # https://github.com/hotoo/gitopen/issues/1
$ gitopen pulls                 # https://github.com/hotoo/gitopen/pulls
$ gitopen wiki
$ gitopen release
$ gitopen tags
$ gitopen pr                    # New a pull-request
$ gitopen commits
$ gitopen network

# global command.
$ gitopen @lizzie
$ gitopen @hotoo/gitopen


# Not Support Yet.
$ gitopen -p .                      # https://github.com/hotoo/gitopen/master/subdir
$ gitopen -p ../README.md           # https://github.com/hotoo/gitopen/blob/master/README.md
$ gitopen -p ../../other-repo-dir   # https://github.com/hotoo/other-repo-dir
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

## License

[MIT](http://hotoo.mit-license.org/)
