-- Add new columns without dropping old ones
ALTER TABLE workspaces
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT,
ADD COLUMN IF NOT EXISTS plan TEXT DEFAULT 'free';

-- Only migrate data for users with feature enabled
UPDATE workspaces w
SET
    stripe_customer_id = p.stripe_customer_id,
    plan = p.plan
FROM profiles p
WHERE
    w.user_id = p.user_id
    AND p.workspace_migration_enabled = true;

-- Add constraint only for new data
ALTER TABLE workspaces
DROP CONSTRAINT IF EXISTS workspaces_stripe_customer_id_key;

ALTER TABLE workspaces
ADD CONSTRAINT workspaces_stripe_customer_id_key UNIQUE (stripe_customer_id);