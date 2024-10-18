-- TABLE --

-- CREATE NEW PIVOT TABLE --
CREATE TABLE IF NOT EXISTS workspace_profiles (
    -- RELATIONSHIPS
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,
    primary key (user_id, workspace_id),

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- REMOVE USER ID FROM WORSPACES --
BEGIN;
-- Drop foreign key constraint if it exists --
ALTER TABLE public.workspaces DROP CONSTRAINT IF EXISTS workspaces_user_id_fkey;
-- Drop  indexes on the user_id column --
DROP INDEX IF EXISTS public.idx_workspaces_user_id;
DROP INDEX IF EXISTS public.idx_unique_home_workspace_per_user;
-- Drop  functions(and dependant trigger) dependant on the user_id column --
DROP TRIGGER IF EXISTS create_profile_and_workspace_trigger ON auth.users;
DROP FUNCTION IF EXISTS create_profile_and_workspace();
DROP FUNCTION IF EXISTS get_assistants_for_user();
-- DROP POLICIES --
DROP POLICY IF EXISTS "Allow full access to own workspaces" ON public.workspaces;
-- Drop column
ALTER TABLE public.workspaces
  DROP COLUMN IF EXISTS user_id;
COMMIT;

-- UPDATE WORKSPACES POLICY --
BEGIN;

-- Drop the old policy
DROP POLICY IF EXISTS "Allow full access to own workspaces" ON public.workspaces;


-- Create the new policy
CREATE POLICY "Allow full access to own workspaces via workspace_profiles"
ON public.workspaces
USING (
  EXISTS (
    SELECT 1
    FROM public.workspace_profiles wp
    WHERE wp.workspace_id = workspaces.id
      AND wp.user_id = auth.uid()
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1
    FROM public.workspace_profiles wp
    WHERE wp.workspace_id = workspaces.id
      AND wp.user_id = auth.uid()
  )
);

COMMIT;

BEGIN;

-- Drop the old policy
DROP POLICY IF EXISTS "Allow full access to own prompt_workspaces" ON public.prompt_workspaces;

-- Create the new policy
CREATE POLICY "Allow workspace members to access prompt_workspaces"
ON prompt_workspaces
FOR ALL  -- Applies to SELECT, INSERT, UPDATE, DELETE
USING (
    EXISTS (
        SELECT 1
        FROM workspace_profiles wp
        WHERE wp.user_id = auth.uid()
          AND wp.workspace_id = prompt_workspaces.workspace_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM workspace_profiles wp
        WHERE wp.user_id = auth.uid()
          AND wp.workspace_id = prompt_workspaces.workspace_id
    )
);

COMMIT;

BEGIN;
-- Drop the old policy
DROP POLICY IF EXISTS "Allow full access to own preset_workspaces" ON public.preset_workspaces;

-- Create the new policy
CREATE POLICY "Allow workspace members to access preset_workspaces"
ON preset_workspaces
FOR ALL  -- Applies to SELECT, INSERT, UPDATE, DELETE
USING (
    EXISTS (
        SELECT 1
        FROM workspace_profiles wp
        WHERE wp.user_id = auth.uid()
          AND wp.workspace_id = preset_workspaces.workspace_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM workspace_profiles wp
        WHERE wp.user_id = auth.uid()
          AND wp.workspace_id = preset_workspaces.workspace_id
    )
);

COMMIT;

BEGIN;
-- Drop the old policy
DROP POLICY IF EXISTS "Allow full access to own model_workspaces" ON public.model_workspaces;

-- Create the new policy
CREATE POLICY "Allow workspace members to access model_workspaces"
ON model_workspaces
FOR ALL  -- Applies to SELECT, INSERT, UPDATE, DELETE
USING (
    EXISTS (
        SELECT 1
        FROM workspace_profiles wp
        WHERE wp.user_id = auth.uid()
          AND wp.workspace_id = model_workspaces.workspace_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM workspace_profiles wp
        WHERE wp.user_id = auth.uid()
          AND wp.workspace_id = model_workspaces.workspace_id
    )
);

COMMIT;

BEGIN;
-- Drop the old policy
DROP POLICY IF EXISTS "Allow full access to own collection_workspaces" ON public.collection_workspaces;

-- Create the new policy
CREATE POLICY "Allow workspace members to access collection_workspaces"
ON collection_workspaces
FOR ALL  -- Applies to SELECT, INSERT, UPDATE, DELETE
USING (
    EXISTS (
        SELECT 1
        FROM workspace_profiles wp
        WHERE wp.user_id = auth.uid()
          AND wp.workspace_id = collection_workspaces.workspace_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM workspace_profiles wp
        WHERE wp.user_id = auth.uid()
          AND wp.workspace_id = collection_workspaces.workspace_id
    )
);

COMMIT;

BEGIN;
-- Drop the old policy
DROP POLICY IF EXISTS "Allow full access to own assistant_workspaces" ON public.assistant_workspaces;

-- Create the new policy
CREATE POLICY "Allow workspace members to access assistant_workspaces"
ON assistant_workspaces
FOR ALL  -- Applies to SELECT, INSERT, UPDATE, DELETE
USING (
    EXISTS (
        SELECT 1
        FROM workspace_profiles wp
        WHERE wp.user_id = auth.uid()
          AND wp.workspace_id = assistant_workspaces.workspace_id
    )
)
WITH CHECK (
    EXISTS (
        SELECT 1
        FROM workspace_profiles wp
        WHERE wp.user_id = auth.uid()
          AND wp.workspace_id = assistant_workspaces.workspace_id
    )
);

COMMIT;