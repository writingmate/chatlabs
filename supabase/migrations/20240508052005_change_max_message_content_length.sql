begin;
alter table messages drop constraint messages_content_check;
alter table messages add constraint messages_content_check check (char_length(content) < 10000000);
commit;
