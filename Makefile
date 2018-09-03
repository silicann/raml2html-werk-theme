include makefilet-download-ondemand.mk

DEPS_ASSETS = $(shell find assets -type f)
ASSETS = dist/assets

$(ASSETS): package.json $(DEPS_ASSETS)
	npm run build
	touch "$(ASSETS)"

.PHONY: install
install: build
	(cd "$(ASSETS)"; find . -type f) | xargs -I "{}" \
		install -Dm 644 "$(ASSETS)/{}" "$(DESTDIR)/usr/share/doc-assets/assets/{}"
