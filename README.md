# mixnd-tasks

A modern SaaS application built with SvelteKit, Supabase, and Stripe.

## Tech Stack

- **Framework:** SvelteKit
- **Database:** Supabase (PostgreSQL)
- **Authentication:** Supabase Auth
- **Payments:** Stripe
- **Styling:** Tailwind CSS + DaisyUI
- **Package Manager:** pnpm

## Features

- User authentication (email/password + OAuth)
- User dashboard and settings
- Subscription management via Stripe
- Blog engine with RSS
- Site search
- Contact form
- Email support

## Development

```bash
# Install dependencies
pnpm install

# Run dev server with secrets
make dev
# Or: doppler run --project mixnd-tasks --config prd -- pnpm dev

# Build for production
make build

# Run tests
pnpm test

# Linting and formatting
pnpm lint
pnpm format
```

## Docker

```bash
# Build Docker image
make docker-build

# Run Docker container
make docker-run
```

## Environment Variables

Required environment variables:

### Build-time (PUBLIC_*)
- `PUBLIC_SUPABASE_URL` - Supabase project URL
- `PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key

### Runtime (PRIVATE_*)
- `PRIVATE_SUPABASE_SERVICE_ROLE` - Supabase service role key
- `PRIVATE_STRIPE_API_KEY` - Stripe secret key
- `PRIVATE_ADMIN_EMAIL` (optional) - Admin email for notifications
- `PRIVATE_RESEND_API_KEY` (optional) - Resend API key for emails
- `PRIVATE_FROM_ADMIN_EMAIL` (optional) - From email address

## Database Setup

Run the migration SQL in your Supabase project:

```bash
# In Supabase SQL Editor, run:
cat database_migration.sql
```

## Deployment

Deployed to Coolify with automatic GitHub webhook integration.

- **Production:** https://mixnd-tasks.mixnd.com
- **Secrets:** Managed via Doppler

## License

MIT