--------------- APPLICATIONS ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS applications (
    -- ID
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),

    -- REQUIRED RELATIONSHIPS
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    workspace_id UUID NOT NULL REFERENCES workspaces(id) ON DELETE CASCADE,

    -- OPTIONAL RELATIONSHIPS
    folder_id UUID REFERENCES folders(id) ON DELETE SET NULL,

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ,

    -- SHARING
    sharing TEXT NOT NULL DEFAULT 'private',

    -- REQUIRED
    name TEXT NOT NULL CHECK (char_length(name) <= 200),
    description TEXT NOT NULL CHECK (char_length(description) <= 1000)
);

-- INDEXES --

CREATE INDEX idx_applications_user_id ON applications (user_id);
CREATE INDEX idx_applications_workspace_id ON applications (workspace_id);

-- RLS --

ALTER TABLE applications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own applications"
    ON applications
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "Allow view access to non-private applications"
    ON applications
    FOR SELECT
    USING (sharing <> 'private');

-- TRIGGERS --

CREATE TRIGGER update_applications_updated_at
BEFORE UPDATE ON applications 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();

--------------- APPLICATION FILES ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS application_files (
    -- REQUIRED RELATIONSHIPS
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    file_id UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,

    PRIMARY KEY(application_id, file_id),

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- INDEXES --

CREATE INDEX idx_application_files_application_id ON application_files (application_id);

-- RLS --

ALTER TABLE application_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own application files"
    ON application_files
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

--------------- APPLICATION TOOLS ---------------

-- TABLE --

CREATE TABLE IF NOT EXISTS application_tools (
    -- REQUIRED RELATIONSHIPS
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    tool_id UUID NOT NULL REFERENCES tools(id) ON DELETE CASCADE,

    PRIMARY KEY(application_id, tool_id),

    -- METADATA
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ
);

-- INDEXES --

CREATE INDEX idx_application_tools_application_id ON application_tools (application_id);

-- RLS --

ALTER TABLE application_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own application tools"
    ON application_tools
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- TRIGGERS --

CREATE TRIGGER update_application_tools_updated_at
BEFORE UPDATE ON application_tools 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();