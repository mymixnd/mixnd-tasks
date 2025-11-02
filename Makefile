.PHONY: dev build docker-build docker-run clean

# Run dev server with Doppler secrets
dev:
	doppler run --project mixnd-tasks --config prd -- pnpm dev

# Build SvelteKit app locally
build:
	doppler run --project mixnd-tasks --config prd -- pnpm build

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
