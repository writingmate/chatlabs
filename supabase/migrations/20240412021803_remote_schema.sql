create extension if not exists "wrappers" with schema "extensions";


drop policy "Pro subscription required for unlimited messages" on "public"."messages";

set check_function_bodies = off;

CREATE OR REPLACE FUNCTION public.delete_storage_object(bucket text, object text, OUT status integer, OUT content text)
 RETURNS record
 LANGUAGE plpgsql
 SECURITY DEFINER
AS $function$DECLARE
  project_url TEXT := 'https://ukrdhiywigevlawgvmbj.supabase.co';
  service_role_key TEXT := 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVrcmRoaXl3aWdldmxhd2d2bWJqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTcxMTU5MTY1MCwiZXhwIjoyMDI3MTY3NjUwfQ.9TbvRaSb23TX2eelUfzksgi33JjVmjHAfjJffkeImPI'; -- full access needed for http request to storage
  url TEXT := project_url || '/storage/v1/object/' || bucket || '/' || object;
BEGIN
  SELECT
      INTO status, content
           result.status::INT, result.content::TEXT
      FROM extensions.http((
    'DELETE',
    url,
    ARRAY[extensions.http_header('authorization','Bearer ' || service_role_key)],
    NULL,
    NULL)::extensions.http_request) AS result;
END;$function$
;


