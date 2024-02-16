--- increase image_url length in the profiles table
BEGIN;
ALTER table profiles drop constraint profiles_image_url_check;
ALTER table profiles add constraint profiles_image_url_check check (char_length(image_url) <= 2000);
COMMIT;
