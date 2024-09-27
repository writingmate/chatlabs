create table if not exists application_platform_tools (
    application_id uuid not null,
    platform_tool_id uuid not null,
    user_id uuid not null,
    created_at timestamp with time zone default now() not null,
    updated_at timestamp with time zone default now() not null,
    foreign key (application_id) references applications (id) on delete cascade,
    foreign key (user_id) references auth.users (id) on delete cascade,
    primary key (application_id, platform_tool_id)
);


-- INDEXES --

CREATE INDEX application_platform_tools_user_id_idx ON application_platform_tools(user_id);
CREATE INDEX application_platform_tools_application_id_idx ON application_platform_tools(application_id);
CREATE INDEX application_platform_tools_tool_id_idx ON application_platform_tools(platform_tool_id);

-- RLS --

ALTER TABLE application_platform_tools ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow full access to own application_platform_tools"
    ON application_platform_tools
    USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- TRIGGERS --

CREATE TRIGGER update_application_platform_tools_updated_at
BEFORE UPDATE ON application_platform_tools 
FOR EACH ROW 
EXECUTE PROCEDURE update_updated_at_column();

