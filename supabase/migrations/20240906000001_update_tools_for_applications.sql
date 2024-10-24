-- Add a new column to the tools table
ALTER TABLE tools
ADD COLUMN can_be_used_in_applications BOOLEAN NOT NULL DEFAULT false;