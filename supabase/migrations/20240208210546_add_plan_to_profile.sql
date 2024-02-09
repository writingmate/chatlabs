--- add plan to profile
ALTER TABLE profiles ADD COLUMN plan TEXT CHECK (char_length(plan) <= 1000) NOT NULL DEFAULT 'free';
