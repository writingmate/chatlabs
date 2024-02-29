alter table public.profiles add column if not exists send_message_on_enter boolean default True;
alter table public.profiles add column if not exists tools_command text default '!';
alter table public.profiles add column if not exists assistant_command text default '@';
alter table public.profiles add column if not exists prompt_command text default '/';
alter table public.profiles add column if not exists files_command text default '#';



