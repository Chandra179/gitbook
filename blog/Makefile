SKIP_DIRS := node_modules dist src scripts .git .gitbook .claude .wrangler

.PHONY: dev deploy

dev:
	@[ -d node_modules ] || npm install
	@echo "Building CSS..."
	@npm run build:css
	@echo "Starting dev server at http://localhost:8080 ..."
	@npm run dev

deploy:
	@./build.sh
	@echo "Deploying to Cloudflare Workers..."
	@npx wrangler deploy
