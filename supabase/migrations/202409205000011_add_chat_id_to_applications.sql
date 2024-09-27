-- Add chat_id column to applications table
ALTER TABLE applications
ADD COLUMN chat_id UUID REFERENCES chats (id) ON DELETE CASCADE;