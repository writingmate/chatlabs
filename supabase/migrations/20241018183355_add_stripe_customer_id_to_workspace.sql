--- add stripe customer id and plan to workspaces
ALTER TABLE workspaces ADD COLUMN stripe_customer_id TEXT CHECK (char_length(stripe_customer_id) <= 1000);
ALTER TABLE workspaces ADD COLUMN plan TEXT CHECK (char_length(plan) <= 1000) NOT NULL DEFAULT 'free';
---remove from the profiles
ALTER TABLE profiles DROP COLUMN IF EXISTS stripe_customer_id;