
# gitopen

Open git remote from browser.

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


# Not Support Yet.
$ gitopen -p .                      # https://github.com/hotoo/gitopen/master/subdir
$ gitopen -p ../README.md           # https://github.com/hotoo/gitopen/blob/master/README.md
$ gitopen -p ../../other-repo-dir   # https://github.com/hotoo/other-repo-dir
```

## Configuration

Default support [github.com](https://github.com/),
[bitbucket.org](https://bitbucket.org/) and [gitlab.com](https://gitlab.com/).

If you use [gitlab](https://gitlab.org/) or other custom web system
build you owner git server, you need config like:

~/.gitopenrc

```yml
gitlab.company.com:
  type: gitlab
  protocal: http
gitlab.example.com:
  type: custom
  protocal: https
  issues: /path/to/issues
  wiki: /path/to/wikis
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
