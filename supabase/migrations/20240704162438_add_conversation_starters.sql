--------------- PROMPTS ---------------

alter table assistants add column conversation_starters text[] not null default '{}';
