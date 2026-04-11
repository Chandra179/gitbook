SKIP_DIRS := node_modules dist src scripts .git .gitbook .claude .wrangler

.PHONY: dev deploy

dev:
	@[ -d node_modules ] || npm install
	@echo "Building CSS..."
	@npm run build:css
	@echo "Starting dev server at http://localhost:3000 ..."
	@npm run dev

deploy:
	@[ -d node_modules ] || npm install
	@rm -rf dist && mkdir -p dist
	@echo "Building CSS..."
	@npm run build:css
	@cp src/index.html dist/index.html
	@cp -r src/css dist/css
	@echo "Generating navigation data..."
	@node scripts/gen-nav.js
	@cp -r src/js dist/js
	@mkdir -p dist/.gitbook
	@[ -d .gitbook/assets ] && cp -r .gitbook/assets dist/.gitbook/assets || true
	@for dir in */; do \
		d=$${dir%/}; \
		echo " $(SKIP_DIRS) " | grep -qw "$$d" || cp -r "$$d" "dist/$$d"; \
	done
	@for file in *.md; do [ -f "$$file" ] && cp "$$file" dist/; done
	@echo "Deploying to Cloudflare Workers..."
	@npx wrangler deploy
