-- Add new columns to workspaces table
ALTER TABLE workspaces
ADD COLUMN stripe_customer_id TEXT,
ADD COLUMN plan TEXT DEFAULT 'free';

-- Migrate data from profiles to workspaces
UPDATE workspaces
SET
    stripe_customer_id = profiles.stripe_customer_id,
    plan = profiles.plan
FROM profiles
WHERE
    workspaces.user_id = profiles.user_id;

-- Remove columns from profiles table
-- ALTER TABLE profiles
-- DROP COLUMN stripe_customer_id,
-- DROP COLUMN plan;

-- Add a unique constraint on stripe_customer_id in workspaces
ALTER TABLE workspaces
ADD CONSTRAINT workspaces_stripe_customer_id_key UNIQUE (stripe_customer_id);