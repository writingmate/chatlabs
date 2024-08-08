create table user_questions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null unique,
  job_role text null,
  company_name text null,
  company_size text null,
  use_cases text null,
  purchase_reason text null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);


alter table user_questions enable row level security;

create policy "Allow logged-in users to view their own user_questions" on user_questions for select using (auth.uid() = user_id);
create policy "Allow logged-in users to insert their own user_questions" on user_questions for insert with check (auth.uid() = user_id);
create policy "Allow logged-in users to update their own user_questions" on user_questions for update using (auth.uid() = user_id);
