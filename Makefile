version = $(shell cat package.json | grep version | awk -F'"' '{print $$4}')
TESTS = $(shell ls -S `find test -type f -name "*.test.js" -print`)
REPORTER = spec
TIMEOUT = 15000
MOCHA_OPTS =

test:
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
