-- Create the arrays of words
CREATE OR REPLACE FUNCTION create_word_arrays()
RETURNS void AS $$
BEGIN
  -- Drop existing arrays if they exist
  DROP TABLE IF EXISTS subdomain_adjectives;
  DROP TABLE IF EXISTS subdomain_nouns;
  
  -- Create and populate adjectives
  CREATE TABLE subdomain_adjectives (word text);
  INSERT INTO subdomain_adjectives (word) VALUES
    ('swift'), ('bright'), ('clever'), ('quick'), ('smart'),
    ('bold'), ('calm'), ('deep'), ('fair'), ('kind'),
    ('wise'), ('warm'), ('cool'), ('fresh'), ('keen'),
    ('pure'), ('safe'), ('sharp'), ('soft'), ('wild');
    
  -- Create and populate nouns
  CREATE TABLE subdomain_nouns (word text);
  INSERT INTO subdomain_nouns (word) VALUES
    ('flow'), ('wave'), ('mind'), ('path'), ('star'),
    ('beam'), ('leaf'), ('bird'), ('wind'), ('moon'),
    ('sun'), ('sky'), ('tree'), ('lake'), ('rain'),
    ('cloud'), ('fire'), ('light'), ('river'), ('ocean');
END;
$$ LANGUAGE plpgsql;

-- Create the function to generate random subdomain
CREATE OR REPLACE FUNCTION generate_random_subdomain()
RETURNS text AS $$
DECLARE
  adj text;
  noun text;
  random_num int;
  subdomain text;
  is_unique boolean := false;
BEGIN
  -- Create word arrays if they don't exist
  PERFORM create_word_arrays();
  
  -- Keep trying until we get a unique subdomain
  WHILE NOT is_unique LOOP
    -- Get random words
    SELECT word INTO adj FROM subdomain_adjectives ORDER BY random() LIMIT 1;
    SELECT word INTO noun FROM subdomain_nouns ORDER BY random() LIMIT 1;
    
    -- Generate random number between 100 and 999
    SELECT floor(random() * 900 + 100)::int INTO random_num;
    
    -- Combine into subdomain
    subdomain := adj || '-' || noun || '-' || random_num::text;
    
    -- Check if subdomain is unique
    SELECT NOT EXISTS (
      SELECT 1 FROM applications WHERE subdomain = subdomain
    ) INTO is_unique;
  END LOOP;
  
  RETURN subdomain;
END;
$$ LANGUAGE plpgsql;

-- Add default random subdomain to applications table
ALTER TABLE applications
ALTER COLUMN subdomain
SET DEFAULT generate_random_subdomain ();

-- Add unique constraint to subdomain
ALTER TABLE applications
ADD CONSTRAINT unique_subdomain UNIQUE (subdomain);

-- Create trigger to ensure subdomain is always set
CREATE OR REPLACE FUNCTION ensure_subdomain()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.subdomain IS NULL THEN
    NEW.subdomain := generate_random_subdomain();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_subdomain BEFORE INSERT ON applications FOR EACH ROW
EXECUTE FUNCTION ensure_subdomain ();