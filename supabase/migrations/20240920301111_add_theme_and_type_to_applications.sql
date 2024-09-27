-- Add theme column to applications table
ALTER TABLE applications
ADD COLUMN theme TEXT CHECK (char_length(theme) <= 100);

-- Add application_type column to applications table
ALTER TABLE applications
ADD COLUMN application_type TEXT CHECK (char_length(application_type) <= 100);

-- Update existing applications to have default values
UPDATE applications
SET theme = 'light',
    application_type = 'web_app'
WHERE theme IS NULL OR application_type IS NULL;

-- Make theme and application_type columns NOT NULL after setting default values
ALTER TABLE applications
ALTER COLUMN theme SET NOT NULL,
ALTER COLUMN application_type SET NOT NULL;