-- CREATE POLICY "Allow full access to own profiles"
--     ON profiles
--     USING (user_id = auth.uid())
--     WITH CHECK (user_id = auth.uid());

-- RESTRICT PLAN FIELD PROFILE UPDATES

create table subscriptions
(
    id         uuid primary key default gen_random_uuid(),
    user_id    uuid references auth.users not null,
    plan       text                       not null,
    status     text                       not null,
    created_at timestamptz      default now(),
    updated_at timestamptz      default now()
);

--- migrate plan fields from profiles to subscriptions
insert into subscriptions (user_id, plan, status, created_at, updated_at)
select user_id, plan, 'active', created_at, updated_at
from profiles;

alter table subscriptions enable row level security;

create policy "Allow full access to own subscriptions"
    on subscriptions
    for select
    using (user_id = auth.uid())
    with check (user_id = auth.uid());
