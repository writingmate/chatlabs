-- Update policies for tables with relationships to workspaces

-- Assistants
DROP POLICY IF EXISTS "Users can view assistants in their workspaces" ON public.assistants;

DROP POLICY IF EXISTS "Users can create assistants" ON public.assistants;

DROP POLICY IF EXISTS "Users can update their assistants" ON public.assistants;

DROP POLICY IF EXISTS "Users can delete their assistants" ON public.assistants;

CREATE POLICY "Users can view assistants in their workspaces" ON public.assistants FOR
SELECT USING (
        CASE
            WHEN has_workspace_feature_enabled (auth.uid ()) THEN EXISTS (
                SELECT 1
                FROM public.assistant_workspaces aw
                WHERE
                    aw.assistant_id = assistants.id
                    AND is_workspace_member (aw.workspace_id, auth.uid ())
            )
            ELSE
            -- Fall back to old behavior
            EXISTS (
                SELECT 1
                FROM public.assistant_workspaces aw
                    JOIN workspaces w ON aw.workspace_id = w.id
                WHERE
                    aw.assistant_id = assistants.id
                    AND w.user_id = auth.uid ()
            )
        END
    );

-- Chats
DROP POLICY IF EXISTS "Users can view chats in their workspaces" ON public.chats;

DROP POLICY IF EXISTS "Users can create chats" ON public.chats;

DROP POLICY IF EXISTS "Users can update their chats" ON public.chats;

DROP POLICY IF EXISTS "Users can delete their chats" ON public.chats;

CREATE POLICY "Users can view chats in their workspaces" ON public.chats FOR
SELECT USING (
        is_workspace_member (
            chats.workspace_id, auth.uid ()
        )
    );

-- Collections
DROP POLICY IF EXISTS "Users can view collections in their workspaces" ON public.collections;

DROP POLICY IF EXISTS "Users can create collections" ON public.collections;

DROP POLICY IF EXISTS "Users can update their collections" ON public.collections;

DROP POLICY IF EXISTS "Users can delete their collections" ON public.collections;

CREATE POLICY "Users can view collections in their workspaces" ON public.collections FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.collection_workspaces cw
            WHERE
                cw.collection_id = collections.id
                AND is_workspace_member (cw.workspace_id, auth.uid ())
        )
    );

-- Files
DROP POLICY IF EXISTS "Users can view files in their workspaces" ON public.files;

DROP POLICY IF EXISTS "Users can create files" ON public.files;

DROP POLICY IF EXISTS "Users can update their files" ON public.files;

DROP POLICY IF EXISTS "Users can delete their files" ON public.files;

CREATE POLICY "Users can view files in their workspaces" ON public.files FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.file_workspaces fw
            WHERE
                fw.file_id = files.id
                AND is_workspace_member (fw.workspace_id, auth.uid ())
        )
    );

-- Folders
DROP POLICY IF EXISTS "Users can view folders in their workspaces" ON public.folders;

DROP POLICY IF EXISTS "Users can create folders" ON public.folders;

DROP POLICY IF EXISTS "Users can update their folders" ON public.folders;

DROP POLICY IF EXISTS "Users can delete their folders" ON public.folders;

CREATE POLICY "Users can view folders in their workspaces" ON public.folders FOR
SELECT USING (
        is_workspace_member (
            folders.workspace_id, auth.uid ()
        )
    );

-- Models
DROP POLICY IF EXISTS "Users can view models in their workspaces" ON public.models;

DROP POLICY IF EXISTS "Users can create models" ON public.models;

DROP POLICY IF EXISTS "Users can update their models" ON public.models;

DROP POLICY IF EXISTS "Users can delete their models" ON public.models;

CREATE POLICY "Users can view models in their workspaces" ON public.models FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.model_workspaces mw
            WHERE
                mw.model_id = models.id
                AND is_workspace_member (mw.workspace_id, auth.uid ())
        )
    );

-- Presets
DROP POLICY IF EXISTS "Users can view presets in their workspaces" ON public.presets;

DROP POLICY IF EXISTS "Users can create presets" ON public.presets;

DROP POLICY IF EXISTS "Users can update their presets" ON public.presets;

DROP POLICY IF EXISTS "Users can delete their presets" ON public.presets;

CREATE POLICY "Users can view presets in their workspaces" ON public.presets FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.preset_workspaces pw
            WHERE
                pw.preset_id = presets.id
                AND is_workspace_member (pw.workspace_id, auth.uid ())
        )
    );

-- Prompts
DROP POLICY IF EXISTS "Users can view prompts in their workspaces" ON public.prompts;

DROP POLICY IF EXISTS "Users can create prompts" ON public.prompts;

DROP POLICY IF EXISTS "Users can update their prompts" ON public.prompts;

DROP POLICY IF EXISTS "Users can delete their prompts" ON public.prompts;

CREATE POLICY "Users can view prompts in their workspaces" ON public.prompts FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.prompt_workspaces pw
            WHERE
                pw.prompt_id = prompts.id
                AND is_workspace_member (pw.workspace_id, auth.uid ())
        )
    );

-- Tools
DROP POLICY IF EXISTS "Users can view tools in their workspaces" ON public.tools;

DROP POLICY IF EXISTS "Users can create tools" ON public.tools;

DROP POLICY IF EXISTS "Users can update their tools" ON public.tools;

DROP POLICY IF EXISTS "Users can delete their tools" ON public.tools;

CREATE POLICY "Users can view tools in their workspaces" ON public.tools FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.tool_workspaces tw
            WHERE
                tw.tool_id = tools.id
                AND is_workspace_member (tw.workspace_id, auth.uid ())
        )
    );

-- Messages (related to chats)
DROP POLICY IF EXISTS "Users can view messages in their workspace chats" ON public.messages;

DROP POLICY IF EXISTS "Users can create messages" ON public.messages;

DROP POLICY IF EXISTS "Users can update their messages" ON public.messages;

DROP POLICY IF EXISTS "Users can delete their messages" ON public.messages;

CREATE POLICY "Users can view messages in their workspace chats" ON public.messages FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.chats c
            WHERE
                c.id = messages.chat_id
                AND is_workspace_member (c.workspace_id, auth.uid ())
        )
    );

-- File items (related to files)
DROP POLICY IF EXISTS "Users can view file items in their workspace files" ON public.file_items;

DROP POLICY IF EXISTS "Users can create file items" ON public.file_items;

DROP POLICY IF EXISTS "Users can update their file items" ON public.file_items;

DROP POLICY IF EXISTS "Users can delete their file items" ON public.file_items;

CREATE POLICY "Users can view file items in their workspace files" ON public.file_items FOR
SELECT USING (
        EXISTS (
            SELECT 1
            FROM public.files f
                JOIN public.file_workspaces fw ON f.id = fw.file_id
            WHERE
                f.id = file_items.file_id
                AND is_workspace_member (fw.workspace_id, auth.uid ())
        )
    );

-- Applications
DROP POLICY IF EXISTS "Users can view applications in their workspaces" ON public.applications;

DROP POLICY IF EXISTS "Users can create applications" ON public.applications;

DROP POLICY IF EXISTS "Users can update their applications" ON public.applications;

DROP POLICY IF EXISTS "Users can delete their applications" ON public.applications;

CREATE POLICY "Users can view applications in their workspaces" ON public.applications FOR
SELECT USING (
        is_workspace_member (
            applications.workspace_id, auth.uid ()
        )
    );

DROP POLICY IF EXISTS "Allow read access to members of a workspace" ON assistant_workspaces;

DROP POLICY IF EXISTS "Allow write access to workspace owners" ON assistant_workspaces;

CREATE POLICY "Allow read access to members of a workspace" ON assistant_workspaces FOR
SELECT USING (
        is_workspace_member (
            assistant_workspaces.workspace_id, auth.uid ()
        )
    );