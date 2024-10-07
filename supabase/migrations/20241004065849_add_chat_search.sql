DROP FUNCTION IF EXISTS search_chats_and_messages;

CREATE OR REPLACE FUNCTION search_chats_and_messages(
  p_workspace_id UUID,
  p_query TEXT
)
RETURNS SETOF chats AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (c.id) c.*
  FROM chats c
  LEFT JOIN messages m ON c.id = m.chat_id
  WHERE c.workspace_id = p_workspace_id
    AND (
      c.name ILIKE '%' || p_query || '%'
      OR m.content ILIKE '%' || p_query || '%'
    )
  ORDER BY c.id, c.created_at DESC
  LIMIT 100;
END;
$$ LANGUAGE plpgsql;