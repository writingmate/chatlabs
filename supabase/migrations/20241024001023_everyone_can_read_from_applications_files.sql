ALTER TABLE public.application_files ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Allow anonymous read access to public application files" ON public.application_files;

CREATE POLICY "Allow anonymous read access to public application files" ON public.application_files FOR
SELECT USING (
        application_id IN (
            SELECT id
            FROM applications
            WHERE
                sharing = 'public'
        )
    );