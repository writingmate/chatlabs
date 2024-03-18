alter table public.profiles add column if not exists model_visibility jsonb default null;
alter table public.chats add column if not exists pinned bool default false;
