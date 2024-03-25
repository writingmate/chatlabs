alter table public.messages
    add column annotation jsonb
        default '{}'
