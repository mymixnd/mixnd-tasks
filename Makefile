.PHONY: dev build test test-e2e test-all docker-build docker-run clean

# Run dev server with Doppler secrets
dev:
	doppler run --project mixnd-tasks --config prd -- pnpm dev

# Build SvelteKit app locally
build:
	doppler run --project mixnd-tasks --config prd -- pnpm build

# Run unit tests (vitest) - no secrets needed
test:
	pnpm test_run

# Run E2E tests (playwright) - uses .env.test for fake credentials
test-e2e:
	pnpm test:e2e

# Run all tests (unit + E2E)
test-all: test test-e2e

# Build Docker image (only PUBLIC_ vars needed at build time)
docker-build:
	docker build \
		--build-arg PUBLIC_SUPABASE_URL=$$(doppler secrets get PUBLIC_SUPABASE_URL --project mixnd-tasks --config prd --plain) \
		--build-arg PUBLIC_SUPABASE_ANON_KEY=$$(doppler secrets get PUBLIC_SUPABASE_ANON_KEY --project mixnd-tasks --config prd --plain) \
		-t mixnd-tasks:latest \
		.

# Run Docker container with all secrets injected by Doppler (runtime secrets)
docker-run:
	doppler run --project mixnd-tasks --config prd -- docker run --rm -p 3000:3000 mixnd-tasks:latest

# Clean build artifacts
clean:
	rm -rf build .svelte-kit node_modules
