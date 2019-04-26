
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

Open git/hg/svn remote url in web browser from terminal.

![demo](./demo.gif)

Support:

* Mac OS X
* Windows
* Linux/Unix

,

* git
* hg
* svn

and

* [GitHub](https://github.com/)
* [GitLab](https://gitlab.com/)
* [BitBucket](https://bitbucket.org/)
* ~~[GitCafe](https://gitcafe.com/)~~ Merged into coding.net.
* [Coding](https://coding.net/)
* [OSC](https://git.oschina.net/)
* [CSDN](https://code.csdn.net/)
* Custom

If you are use [GitBucket](https://github.com/takezoe/gitbucket),
[tell me please](https://github.com/hotoo/gitopen/issues/new).

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
$ gitopen prs                   # https://github.com/hotoo/gitopen/pulls, alias `pulls`, `mrs`.
$ gitopen wiki                  # Open wiki pages.
$ gitopen release               # Open releases page.
$ gitopen tags                  # Open tags page.
$ gitopen commits               # Open commits page.
$ gitopen brs                   # Open branches page, alias `branchs` and `branches`.
$ gitopen {hash}                # Open commit page by hash code.

$ gitopen README.md             # Open remote blob url. default use current working branch.
$ gitopen README.md -b branch   # Open remote blob url by given branch.
$ gitopen README.md :branch     # Open remote blob url by given branch.
$ gitopen path/to/dir           # Open remote tree url. default use current working branch.

# global command.
$ gitopen @lizzie               # https://github.com/lizzie
$ gitopen @hotoo/gitopen        # https://github.com/hotoo/gitopen
```

## Configuration

Default support [github.com](https://github.com/),
[bitbucket.org](https://bitbucket.org/),
[gitlab.com](https://gitlab.com/),
~~[gitcafe.com](https://gitcafe.com/)~~,
[coding.net](https://coding.net/),
[git.oschina.net](https://git.oschina.net/)
and [CSDN](https://code.csdn.net/).

If you are use [GitHub Enterprise](https://enterprise.github.com/),
[GitLab Community Edition (CE), GitLab Enterprise Edition (EE)](https://gitlab.org/),
[Atlassian Stash](https://www.atlassian.com/software/stash),
~~[GitCafe Enterprise](https://enterprise.gitcafe.com/)~~
You need config in ~/.gitconfig file:

```
[gitopen "github.company.com"]
	type = github
	protocol = https
[gitopen "gitlab.company.net"]
	type = gitlab
	protocol = http
```

You can config it by git command-line:

```bash
; global
$ git config --global gitopen.github.company.com.type github
$ git config --global gitopen.github.company.com.protocol https

; set local repo default remote name.
$ git remote add gitlabRemote git@gitlab.com:hotoo/gitopen.git
$ git config gitopen.remote gitlabRemote
```


Also you can config it in ~/.gitopenrc file for global settings:

```yaml
github.company.com:
  type: github
  protocol: https
gitlab.company.net:
  type: gitlab
  protocol: http
```

- `github.company.com`, `gitlab.company.net` is your company's git web server domain name.
  - `type` is the type of your company's git web server, support `github`, `gitlab`, `gitbucket`, `coding`, `oschina`, `csdn`.
  - `protocol`: protocol of your company's git web server, `http` or `https`.

Else if you are using other custom web system build your owner git server, you need config like:

```yaml
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
  open = !gitopen
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

### $ gitopen blame path/to/file

Open file blame information page.

### $ gitopen commits

Open git repository commits list page.

alias:

* `$ gitopen commit`
* `$ gitopen ci`

### $ gitopen {hash}

Open  commit page by hash code.

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

### $ gitopen filename [--branch <branch>]

Open given file on given branch, default use current working branch.

alias:

* `$ gitopen filename :branch`
* `$ gitopen filename -b branch`

### $ gitopen directory [--branch <branch>]

Open given directory on given branch, default use current working branch.

alias:

* `$ gitopen directory :branch`
* `$ gitopen directory -b branch`

### $ gitopen snippet

[LOCAL COMMAND] Open new snippet.

[GLOBAL COMMAND] Open https://gist.github.com/

alias:

* `$ gitopen snip`
* `$ gitopen gist`

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

## Options

### -p, --path

Specify file/directory path, default is current working directory.

If you want open a file or directory name is reserved words, like `issues` and
`pr`, you can use `--path` option instead.

```
$ gitopen -p issues
$ gitopen --path pr
```

### -b, --branch

Specify git/hg branch name, default is current working branch.

### -r, --remote

Specify git remote name, default is `origin`.

### -v, --verbose

Display detail information for debug.

## License

[MIT](http://hotoo.mit-license.org/)

## Donate

If this tool is useful for you, please [Star this repository](https://github.com/hotoo/gitopen).

And maybe you want to donate me via Alipay / WeChat:

![Alipay:hotoo.cn@gmail.com, WeChat:hotoome](https://hotoo.github.io/images/donate-hotoo.png)

or donate to my wife [@lizzie](https://github.com/lizzie)

![Alipay:shenyan1985@gmail.com, WeChat:SunsetSunrising](https://hotoo.github.io/images/donate-lizzie.png)

Thank you.
