ALTER TABLE public.applications ADD COLUMN icon TEXT;

COMMENT ON COLUMN public.applications.icon IS 'URL or base64 encoded image data for the application icon';