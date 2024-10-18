DROP TABLE IF EXISTS workspace_users;
-- Create workspace_users table
CREATE TABLE workspace_users (
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

-- Add this after the CREATE TABLE workspace_users statement
ALTER TABLE workspace_users
ADD CONSTRAINT workspace_users_workspace_id_email_key UNIQUE (workspace_id, email);

-- Migrate existing workspace owners
INSERT INTO
    workspace_users (
        workspace_id,
        user_id,
        email,
        role,
        status
    )
SELECT
    w.id AS workspace_id,
    w.user_id,
    u.email,
    'OWNER' AS role,
    'ACTIVE' AS status
FROM workspaces w
    JOIN auth.users u ON w.user_id = u.id
ON CONFLICT (workspace_id, user_id) DO NOTHING;

-- Create a function to automatically add workspace owner if none exists
CREATE OR REPLACE FUNCTION add_workspace_owner()
RETURNS TRIGGER AS $$
BEGIN
  
  IF NOT EXISTS (
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

-- Create a trigger to automatically add workspace owner when a new workspace is created
DROP TRIGGER IF EXISTS workspace_owner_trigger ON workspaces;

CREATE TRIGGER workspace_owner_trigger
AFTER INSERT ON workspaces FOR EACH ROW
EXECUTE FUNCTION add_workspace_owner ();

-- Create a security definer function to check workspace membership with optional role
CREATE OR REPLACE FUNCTION is_workspace_member(workspace_id UUID, user_id UUID, check_role TEXT DEFAULT NULL)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM workspace_users
    WHERE workspace_users.workspace_id = $1
      AND workspace_users.user_id = $2
      AND (check_role IS NULL OR workspace_users.role = check_role)
  );
END;
$$ LANGUAGE plpgsql

SECURITY DEFINER;

-- Create a security definer function to check workspace ownership
CREATE OR REPLACE FUNCTION is_workspace_owner(workspace_id UUID, user_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN is_workspace_member(workspace_id, user_id);
END;
$$ LANGUAGE plpgsql

SECURITY DEFINER;

-- Drop existing policies
DROP POLICY IF EXISTS "Users can view workspace users" ON workspace_users;

DROP POLICY IF EXISTS "Workspace owners can manage workspace_users" ON workspace_users;

-- Create new policies using the security definer functions
CREATE POLICY "Users can view workspace users" ON workspace_users FOR
SELECT USING (
        is_workspace_member (workspace_id, auth.uid ())
    );

-- Add these policies after the existing "Users can view workspace users" policy

-- Allow workspace owners to insert new users
CREATE POLICY "Workspace owners can insert workspace users" ON workspace_users FOR INSERT
WITH
    CHECK (
        is_workspace_owner (workspace_id, auth.uid ())
    );

-- Allow workspace owners to update workspace users
CREATE POLICY "Workspace owners can update workspace users" ON workspace_users
FOR UPDATE
    USING (
        is_workspace_owner (workspace_id, auth.uid ())
    );

-- Allow users to update their own status (for accepting invitations)
CREATE POLICY "Users can update their own status" ON workspace_users
FOR UPDATE
    USING (
        auth.uid () = user_id
        AND status IN ('INVITED', 'PENDING')
    )
WITH
    CHECK (
        auth.uid () = user_id
        AND status = 'ACTIVE'
    );

-- Allow workspace owners to delete workspace users
CREATE POLICY "Workspace owners can delete workspace users" ON workspace_users FOR DELETE USING (
    is_workspace_owner (workspace_id, auth.uid ())
);

-- Ensure RLS is enabled on workspace_users table (this line already exists, but including for completeness)
ALTER TABLE workspace_users ENABLE ROW LEVEL SECURITY;

-- Drop existing RLS policies on workspaces table
DROP POLICY IF EXISTS "Users can view their own workspaces" ON workspaces;

DROP POLICY IF EXISTS "Users can update their own workspaces" ON workspaces;

DROP POLICY IF EXISTS "Users can delete their own workspaces" ON workspaces;

DROP POLICY IF EXISTS "Users can view workspaces they are a member of" ON workspaces;

DROP POLICY IF EXISTS "Workspace owners can update their workspaces" ON workspaces;

DROP POLICY IF EXISTS "Workspace owners can delete their workspaces" ON workspaces;

-- Create new RLS policies for workspaces table
CREATE POLICY "Users can view workspaces they are a member of" ON workspaces FOR
SELECT USING (
        is_workspace_member (workspaces.id, auth.uid ())
    );

CREATE POLICY "Workspace owners can update their workspaces" ON workspaces
FOR UPDATE
WITH
    CHECK (
        is_workspace_owner (workspaces.id, auth.uid ())
    );

CREATE POLICY "Workspace owners can delete their workspaces" ON workspaces FOR DELETE USING (
    is_workspace_owner (workspaces.id, auth.uid ())
);

-- Update the insert policy to use the new workspace_users table
DROP POLICY IF EXISTS "Users can create workspaces" ON workspaces;

CREATE POLICY "Users can create workspaces" ON workspaces FOR INSERT
WITH
    CHECK (auth.uid () IS NOT NULL);

-- Ensure RLS is enabled on workspaces table
ALTER TABLE workspaces ENABLE ROW LEVEL SECURITY;