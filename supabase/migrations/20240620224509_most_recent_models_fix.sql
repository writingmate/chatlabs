BEGIN;
create or replace view recent_models as
select model,
       max(created_at) as last_used_at,
       user_id
from public.chats
group by model, user_id
order by last_used_at desc;
COMMIT;
