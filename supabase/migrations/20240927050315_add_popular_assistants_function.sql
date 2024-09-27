DROP FUNCTION IF EXISTS get_assistants_for_user(UUID, UUID);

CREATE FUNCTION get_assistants_for_user(p_user_id UUID, p_workspace_id UUID)
RETURNS setof public.assistants AS $$
BEGIN
  RETURN QUERY
  WITH user_chats AS (
    SELECT assistant_id, COUNT(*) as chat_count
    FROM chats
    WHERE user_id = p_user_id
    GROUP BY assistant_id
  ),
  workspace_assistants AS (
    SELECT DISTINCT a.id
    FROM assistants a
    JOIN assistant_workspaces aw ON a.id = aw.assistant_id
    WHERE aw.workspace_id = p_workspace_id
  ),
  all_assistants AS (
    SELECT 
      a.*,
      COALESCE(uc.chat_count, 0) as chat_count,
      CASE 
        WHEN uc.assistant_id IS NOT NULL THEN true
        WHEN wa.id IS NOT NULL THEN true
        ELSE false
      END as is_private
    FROM assistants a
    LEFT JOIN user_chats uc ON a.id = uc.assistant_id
    LEFT JOIN workspace_assistants wa ON a.id = wa.id
    WHERE uc.assistant_id IS NOT NULL 
      OR wa.id IS NOT NULL 
      OR a.sharing = 'public'
  )
  SELECT a.*
  FROM all_assistants inner join
    assistants a on a.id = all_assistants.id
  ORDER BY 
    is_private DESC,
    chat_count DESC,
    name ASC;
END;
$$ LANGUAGE plpgsql;
