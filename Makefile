include makefilet-download-ondemand.mk

DEPS_ASSETS = $(shell find assets -type f)
ASSETS = dist/assets

.PHONY: build
build: $(ASSETS)

node_modules: package.json package-lock.json
	npm ci
	touch node_modules

$(ASSETS): node_modules package.json $(DEPS_ASSETS)
	npm run build
	touch "$(ASSETS)"

.PHONY: install
install: build
	(cd "$(ASSETS)"; find . -type f) | xargs -I "{}" \
		install -Dm 644 "$(ASSETS)/{}" "$(DESTDIR)/usr/share/doc-assets/assets/{}"
