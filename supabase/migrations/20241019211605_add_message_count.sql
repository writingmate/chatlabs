-- Create the daily_message_count table
CREATE TABLE daily_message_count (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4 (),
    day DATE NOT NULL,
    user_id UUID NOT NULL REFERENCES auth.users (id),
    model_id TEXT NOT NULL,
    count INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create a unique constraint on day, user_id, and model_id
ALTER TABLE daily_message_count
ADD CONSTRAINT daily_message_count_unique UNIQUE (day, user_id, model_id);

-- Create an index for faster queries
CREATE INDEX daily_message_count_user_id_idx ON daily_message_count (user_id);

-- Create a function to update or insert the daily message count
CREATE OR REPLACE FUNCTION update_daily_message_count()
RETURNS TRIGGER AS $$
BEGIN
  
  IF NEW.role = 'user' THEN
    INSERT INTO daily_message_count (day, user_id, model_id, count)
    VALUES (CURRENT_DATE, NEW.user_id, NEW.model, 1)
    ON CONFLICT (day, user_id, model_id)
    DO UPDATE SET count = daily_message_count.count + 1, updated_at = CURRENT_TIMESTAMP;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql

SECURITY DEFINER;

-- Create a trigger to update the daily message count
CREATE TRIGGER update_daily_message_count_trigger
AFTER INSERT ON messages FOR EACH ROW
EXECUTE FUNCTION update_daily_message_count ();

-- Create a policy to restrict visibility to the user and workspace members
CREATE POLICY "Daily message count visibility" ON daily_message_count FOR ALL USING (auth.uid () = user_id);

-- Enable RLS on the daily_message_count table
ALTER TABLE daily_message_count ENABLE ROW LEVEL SECURITY;