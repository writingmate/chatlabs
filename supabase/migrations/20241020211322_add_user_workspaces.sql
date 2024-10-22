-- Create workspace_users table without dropping existing functionality
CREATE TABLE IF NOT EXISTS workspace_users (
    workspace_id UUID NOT NULL REFERENCES workspaces (id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    role TEXT NOT NULL CHECK (role IN ('OWNER', 'MEMBER')),
    status TEXT NOT NULL CHECK (
        status IN (
            'INVITED',
            'ACTIVE',
            'PENDING'
        )
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE ('utc'::text, NOW()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE,
    PRIMARY KEY (workspace_id, user_id)
);

-- Add unique constraint without dropping
ALTER TABLE workspace_users
DROP CONSTRAINT IF EXISTS workspace_users_workspace_id_email_key;

ALTER TABLE workspace_users
ADD CONSTRAINT workspace_users_workspace_id_email_key UNIQUE (workspace_id, email);

-- Add column to profiles to track migration status
ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS workspace_migration_enabled BOOLEAN DEFAULT false;

-- Only migrate users who have the feature enabled
INSERT INTO
    workspace_users (
        workspace_id,
        user_id,
        email,
        role,
        status
    )
SELECT DISTINCT
    w.id AS workspace_id,
    w.user_id,
    u.email,
    'OWNER' AS role,
    'ACTIVE' AS status
FROM
    workspaces w
    JOIN auth.users u ON w.user_id = u.id
    JOIN profiles p ON w.user_id = p.user_id
WHERE
    p.workspace_migration_enabled = true
    AND NOT EXISTS (
        SELECT 1
        FROM workspace_users wu
        WHERE
            wu.workspace_id = w.id
            AND wu.user_id = w.user_id
    );

-- Create or replace function for workspace owner
CREATE OR REPLACE FUNCTION add_workspace_owner()
RETURNS TRIGGER AS $$
BEGIN
  
  IF EXISTS (
    SELECT 1 FROM profiles 
    WHERE user_id = NEW.user_id 
    AND workspace_migration_enabled = true
  ) 
  AND NOT EXISTS (
    SELECT 1 FROM workspace_users
    WHERE workspace_id = NEW.id AND role = 'OWNER'
  ) THEN
    INSERT INTO workspace_users (workspace_id, user_id, email, role, status)
    VALUES (NEW.id, NEW.user_id, (SELECT email FROM auth.users WHERE id = NEW.user_id), 'OWNER', 'ACTIVE');
  END IF;
  RETURN NEW;
END
$$ LANGUAGE plpgsql

SECURITY DEFINER;

-- Create helper function to check if user has workspace feature enabled
CREATE OR REPLACE FUNCTION has_workspace_feature_enabled(user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = $1
    AND workspace_migration_enabled = true
  );
END;
$$ LANGUAGE plpgsql

SECURITY DEFINER;

-- Modify workspace member check to consider feature flag
CREATE OR REPLACE FUNCTION is_workspace_member(workspace_id UUID, user_id UUID, check_role TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  
  IF NOT has_workspace_feature_enabled(user_id) THEN
    RETURN EXISTS (
      SELECT 1 FROM workspaces
      WHERE workspaces.id = workspace_id
      AND workspaces.user_id = user_id
    );
  END IF;

  
  RETURN EXISTS (
    SELECT 1
    FROM workspace_users
    WHERE workspace_users.workspace_id = $1
      AND workspace_users.user_id = $2
      AND (check_role IS NULL OR workspace_users.role = check_role)
      AND status = 'ACTIVE'
  );
END;
$$ LANGUAGE plpgsql

SECURITY DEFINER;

-- Drop existing policies first
DROP POLICY IF EXISTS "Users can view workspace users" ON workspace_users;

DROP POLICY IF EXISTS "Workspace owners can insert workspace users" ON workspace_users;

DROP POLICY IF EXISTS "Workspace owners can update workspace users" ON workspace_users;

DROP POLICY IF EXISTS "Users can update their own status" ON workspace_users;

DROP POLICY IF EXISTS "Workspace owners can delete workspace users" ON workspace_users;

-- Create new policies
CREATE POLICY "Users can view workspace users" ON workspace_users FOR
SELECT USING (
        has_workspace_feature_enabled (auth.uid ())
        AND is_workspace_member (workspace_id, auth.uid ())
    );

CREATE POLICY "Workspace owners can insert workspace users" ON workspace_users FOR INSERT
WITH
    CHECK (
        has_workspace_feature_enabled (auth.uid ())
        AND EXISTS (
            SELECT 1
            FROM workspace_users wu
            WHERE
                wu.workspace_id = workspace_id
                AND wu.user_id = auth.uid ()
                AND wu.role = 'OWNER'
                AND wu.status = 'ACTIVE'
        )
    );

CREATE POLICY "Workspace owners can update workspace users" ON workspace_users
FOR UPDATE
    USING (
        has_workspace_feature_enabled (auth.uid ())
        AND EXISTS (
            SELECT 1
            FROM workspace_users wu
            WHERE
                wu.workspace_id = workspace_id
                AND wu.user_id = auth.uid ()
                AND wu.role = 'OWNER'
                AND wu.status = 'ACTIVE'
        )
    );

CREATE POLICY "Users can update their own status" ON workspace_users
FOR UPDATE
    USING (
        has_workspace_feature_enabled (auth.uid ())
        AND auth.uid () = user_id
        AND status IN ('INVITED', 'PENDING')
    )
WITH
    CHECK (
        auth.uid () = user_id
        AND status = 'ACTIVE'
    );

CREATE POLICY "Workspace owners can delete workspace users" ON workspace_users FOR DELETE USING (
    has_workspace_feature_enabled (auth.uid ())
    AND EXISTS (
        SELECT 1
        FROM workspace_users wu
        WHERE
            wu.workspace_id = workspace_id
            AND wu.user_id = auth.uid ()
            AND wu.role = 'OWNER'
            AND wu.status = 'ACTIVE'
    )
);

-- Enable RLS
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;

-- Function to enable workspace feature for a user
CREATE OR REPLACE FUNCTION enable_workspace_feature(target_user_id UUID)
RETURNS VOID AS $$
BEGIN
  
  UPDATE profiles 
  SET workspace_migration_enabled = true
  WHERE user_id = target_user_id;

  
  INSERT INTO workspace_users (
    workspace_id,
    user_id,
    email,
    role,
    status
  )
  SELECT DISTINCT
    w.id,
    w.user_id,
    u.email,
    'OWNER',
    'ACTIVE'
  FROM workspaces w
  JOIN auth.users u ON w.user_id = target_user_id
  WHERE w.user_id = target_user_id
  AND NOT EXISTS (
    SELECT 1 FROM workspace_users wu 
    WHERE wu.workspace_id = w.id AND wu.user_id = w.user_id
  );
END;
$$ LANGUAGE plpgsql

SECURITY DEFINER;