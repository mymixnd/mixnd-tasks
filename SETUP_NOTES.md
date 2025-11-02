# Setup Notes - Supabase & Stripe

**Purpose:** Preserved setup instructions from original CMSaasStarter template for future reference when configuring Supabase and Stripe features.

---

## Supabase Setup

### Create Project
- Create a Supabase account
- Create a new Supabase project in the console
- Wait for the database to launch

### Database Schema
- For new Supabase projects:
  - Go to the [SQL Editor](https://supabase.com/dashboard/project/_/sql) page in the Dashboard
  - Run the SQL from `database_migration.sql` to create the initial schema
- For existing projects:
  - Apply migrations from the `supabase/migrations` directory:
    1. Go to the Supabase dashboard's SQL Editor
    2. Identify the last migration you applied, then run the SQL content of each subsequent file in chronological order

### Enable User Signups
- Sometimes new signups are disabled by default in Supabase projects
- Enable user signups in the [Supabase console](https://app.supabase.com/project/_/settings/auth)

### Get API Keys
- Go to the [API Settings](https://supabase.com/dashboard/project/_/settings/api) page in the Dashboard
- Find your Project-URL (`PUBLIC_SUPABASE_URL`), anon (`PUBLIC_SUPABASE_ANON_KEY`) and service_role (`PRIVATE_SUPABASE_SERVICE_ROLE`)
- For local development: create a `.env.local` file:
  ```
  PUBLIC_SUPABASE_URL=https://your-project.supabase.co
  PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  PRIVATE_SUPABASE_SERVICE_ROLE=your service_role secret
  ```
- For production, add these keys to your deployment environment. Encrypt your service role.

### Auth Callback
- Set your default callback URL for auth in the Supabase Auth console. For example: `https://yourdomain.com/auth/callback`
- Also add that same URL to the "allowed redirect URL" list in the Supabase auth console further down the page
- Add a link to the redirect URL allow list which allows parameters to your auth callback. For example: `https://yourdomain.com/auth/callback?*`
- Also add any local development URLs you want to use in testing to the list for your dev environment:
  - `http://localhost:5173/auth/callback`
  - `http://localhost:5173/auth/callback?*`
- Test that the "sign up" and "forgot password" emails link back to your domain correctly by checking they have a redirect_to parameter to your `yourdomain.com/auth/callback`. If they link to the base URL or another page, double check you have the config above set correctly.

### OAuth Logins
- Decide which oauth logins you want to support, and set them up in the Supabase Auth console under "Auth Providers"
- Be sure to provide them the Supabase callback URL
- Also be sure to set any platform specific permissions/settings to retrieve their email as part of the login (for example, for Github it's under `Account Permissions > Email Address > Read Only Access`)
- Edit `oauthProviders` list in `/src/routes/(marketing)/login/login_config.ts` with the list of providers you chose. If you don't want any OAuth options, make this an empty array.
- Test each provider to ensure you setup the client ID, client secret and callback correctly for each

### Auth Email SMTP
- Supabase has a limit of 4 emails per hour on their development server
- You should [Configure a Custom SMTP](https://supabase.com/docs/guides/auth/auth-smtp) sending emails from your own domain
- Customize the email templates in the Supabase Auth console to include your product name and branding

### Test Authentication
- Open the `/login` page in your browser, and ensure you can sign up, confirm email, log in, and edit your account

---

## Stripe Setup

### Create Account
- Create a Stripe account

### Create Product and Price Tiers
- Create your [products](https://stripe.com/docs/api/products) and their [prices](https://stripe.com/docs/api/prices) in the Dashboard or with the Stripe CLI
- Works best if you define each tier as a separate product (eg, `MyApp Free`, `MyApp Pro`, `MyApp Enterprise`)
- Include a monthly and annual price for each product if you want to support multiple billing periods
- You do not need to create a free plan in Stripe. The free plan is managed within the app.

### Setup Environment
- Get your [Secret API](https://dashboard.stripe.com/test/apikeys) key, and add it as environment variable `PRIVATE_STRIPE_API_KEY`
- Be sure to use test keys for development, and keep your production/live keys secret and secure

### Theme Your Stripe Integration (Optional)
- Change the colors and fonts to match your brand [here](https://dashboard.stripe.com/settings/branding)

### Update Pricing Plan Data
- See `/src/routes/(marketing)/pricing/pricing_plans.ts` and fill in all fields for each plan
- `stripe_price_id` and `stripe_product_id` should only be omitted on a single "free" plan. Multiple free plans are not supported.
- The product in Stripe can contain several prices for the same product (annual, monthly, etc). The `stripe_price_id` you choose to put in this json will be the default we use for the checkout experience. However, if you have more prices configured for a product configured, the user can switch between them in the management portal.
- Set the `defaultPlanId` to the plan the user will see as their "current plan" after signup, but before subscribing to a paid plan (typically "free"). It should align to the plan with no `stripe_price_id`.
- If you want an item highlighted on `/pricing`, specify that plan ID in `/src/routes/(marketing)/pricing/+page.svelte`

### Update Portal Configuration
- Open [stripe portal config](https://dashboard.stripe.com/test/settings/billing/portal) and make the following changes:
  - Disallow editing email under customer information (since we allow editing in primary portal)
  - Optional: setup a custom domain so Stripe pages use your own domain

### Repeat Steps in Production Environment
- Repeat all steps above with production Stripe account and keys

---

## Email Setup (Optional)

Email capabilities are optional and disabled by default.

### Resend API (Optional)
- Sign up for [Resend](https://resend.com)
- Get your API key
- Set `PRIVATE_RESEND_API_KEY` environment variable
- Set `PRIVATE_ADMIN_EMAIL` for admin notifications
- Set `PRIVATE_FROM_ADMIN_EMAIL` for the from address (optional)

### Email Templates
- Email templates use Handlebars
- Located in `src/lib/emails/`
- Create both `_text.hbs` and `_html.hbs` versions for each template

---

## Notes

- The Auth UI should automatically update based on your DaisyUI style
- Further design tweaks can be made in `src/routes/(marketing)/login/login_config.ts`
- See [Auth UI docs](https://supabase.com/docs/guides/auth/auth-helpers/auth-ui#customization) for options