CREATE OR REPLACE FUNCTION delete_old_generated_image()
RETURNS TRIGGER
LANGUAGE 'plpgsql'
SECURITY DEFINER
AS $$
DECLARE
  status INT;
  content TEXT;
BEGIN
  IF TG_OP = 'DELETE' THEN
    SELECT
      INTO status, content
      result.status, result.content
      FROM public.delete_storage_object_from_bucket('generated_images', OLD.image_path) AS result;
    IF status <> 200 THEN
      RAISE WARNING 'Could not delete generated image: % %', status, content;
    END IF;
  END IF;
  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$;

-- TRIGGERS --

CREATE TRIGGER delete_old_generated_image
AFTER DELETE ON users
FOR EACH ROW
EXECUTE PROCEDURE delete_old_generated_image();

-- STORAGE --

INSERT INTO storage.buckets (id, name, public) VALUES ('generated_images', 'generated_images', false);

CREATE OR REPLACE FUNCTION public.non_private_generated_exists(p_name text)
RETURNS boolean
LANGUAGE sql
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1
        FROM generateds
        WHERE (id::text = (storage.filename(p_name))) AND sharing <> 'private'
    );
$$;

CREATE POLICY "Allow public read access on non-private generated images"
    ON storage.objects FOR SELECT TO public
    USING (bucket_id = 'generated_images' AND public.non_private_generated_exists(name));

CREATE POLICY "Allow insert access to own generated images"
    ON storage.objects FOR INSERT TO authenticated
    WITH CHECK (bucket_id = 'generated_images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow update access to own generated images"
    ON storage.objects FOR UPDATE TO authenticated
    USING (bucket_id = 'generated_images' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow delete access to own generated images"
    ON storage.objects FOR DELETE TO authenticated
    USING (bucket_id = 'generated_images' AND (storage.foldername(name))[1] = auth.uid()::text);
