version = $(shell cat package.json | grep version | awk -F'"' '{print $$4}')
TESTS = $(shell ls -S `find test -type f -name "*.test.js" -print`)
HG_SSH_DIR = test/hgssh
HG_HTTP_DIR = test/hghttp
REPORTER = spec
TIMEOUT = 15000
MOCHA_OPTS =

install:
	@npm install

lint:
	@./node_modules/.bin/eslint bin lib test

test: lint
	@if [ ! -d $(HG_SSH_DIR) ]; then \
		mkdir -p $(HG_SSH_DIR);  \
		cd $(HG_SSH_DIR);  \
		hg init;  \
		echo [paths] >> .hg/hgrc;  \
		echo default = ssh://hg@bitbucket.org/hotoo/gitopen >> .hg/hgrc;  \
	fi
	@if [ ! -d $(HG_HTTP_DIR) ]; then \
		mkdir -p $(HG_HTTP_DIR);  \
		cd $(HG_HTTP_DIR);  \
		hg init;  \
		echo [paths] >> .hg/hgrc;  \
		echo default = https://hotoo@bitbucket.org/hotoo/gitopen >> .hg/hgrc;  \
	fi
	@./node_modules/.bin/istanbul cover \
	./node_modules/.bin/_mocha \
		-- \
		--harmony \
		--reporter $(REPORTER) \
		--timeout $(TIMEOUT) \
		--require should \
		--inline-diffs \
		$(TESTS)

publish:
	@npm publish
	@git tag $(version)
	@git push origin $(version)

.PHONY: test publish coverage install
