-- Add subscription tracking fields to stripe_customers table
alter table stripe_customers
  add column subscription_id text,
  add column subscription_status text,
  add column current_period_end timestamp with time zone;

-- Create index for faster lookups by subscription_id
create index idx_stripe_customers_subscription_id on stripe_customers(subscription_id);