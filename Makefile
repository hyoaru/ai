.PHONY: build link unlink

build:
	@./scripts/build.sh

link:
	@./scripts/link.sh

unlink:
	@./scripts/link.sh remove
