version = $(shell cat package.json | grep version | awk -F'"' '{print $$4}')
TESTS = $(shell ls -S `find test -type f -name "*.test.js" -print`)
HG_SSH_DIR = test/hgssh
HG_HTTP_DIR = test/hghttp
REPORTER = spec
TIMEOUT = 15000
MOCHA_OPTS =

install:
	@npm install
	@
	@hg clone https://hotoo@bitbucket.org/hotoo/hgtest test/hghttp/

test:
	@if [ ! -d $(HG_SSH_DIR) ]; then hg clone ssh://hg@bitbucket.org/hotoo/hgtest $(HG_SSH_DIR); fi
	@if [ ! -d $(HG_HTTP_DIR) ]; then hg clone ssh://hg@bitbucket.org/hotoo/hgtest $(HG_HTTP_DIR); fi
	@./node_modules/.bin/mocha \
		--harmony \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		--require should \
		$(MOCHA_OPTS) \
		$(TESTS)

publish:
	@npm publish
	@git tag $(version)
	@git push origin $(version)

.PHONY: test publish
