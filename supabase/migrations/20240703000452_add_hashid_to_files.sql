begin transaction;
create sequence files_num_id_seq;

alter table public.files
    add column if not exists hashid text unique not null default id_encode(nextval('files_num_id_seq'));
commit;
