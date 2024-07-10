--- INSERT INTO storage.buckets (id, name, public) VALUES ('assistant_images', 'assistant_images', false);
UPDATE storage.buckets SET public = true WHERE id = 'assistant_images';
