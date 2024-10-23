-- Create the arrays of words
CREATE TABLE IF NOT EXISTS public.subdomain_adjectives (word text PRIMARY KEY);

CREATE TABLE IF NOT EXISTS public.subdomain_nouns (word text PRIMARY KEY);

-- Populate adjectives if empty
INSERT INTO
    public.subdomain_adjectives (word)
SELECT word
FROM (
        VALUES ('swift'), ('bright'), ('clever'), ('quick'), ('smart'), ('bold'), ('calm'), ('deep'), ('fair'), ('kind'), ('wise'), ('warm'), ('cool'), ('fresh'), ('keen'), ('pure'), ('safe'), ('sharp'), ('soft'), ('wild')
    ) AS words (word)
ON CONFLICT (word) DO NOTHING;

-- Populate nouns if empty
INSERT INTO
    public.subdomain_nouns (word)
SELECT word
FROM (
        VALUES ('flow'), ('wave'), ('mind'), ('path'), ('star'), ('beam'), ('leaf'), ('bird'), ('wind'), ('moon'), ('sun'), ('sky'), ('tree'), ('lake'), ('rain'), ('cloud'), ('fire'), ('light'), ('river'), ('ocean')
    ) AS words (word)
ON CONFLICT (word) DO NOTHING;

-- Create the function to generate random subdomain
CREATE OR REPLACE FUNCTION public.generate_random_subdomain()
RETURNS text
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
DECLARE
    adj text;
    noun text;
    random_num int;
    generated_subdomain text;
    is_unique boolean := false;
BEGIN
    -- Keep trying until we get a unique subdomain
    WHILE NOT is_unique LOOP
        -- Get random words
        SELECT word INTO adj FROM public.subdomain_adjectives ORDER BY random() LIMIT 1;
        SELECT word INTO noun FROM public.subdomain_nouns ORDER BY random() LIMIT 1;
        
        -- Generate random number between 100 and 999
        SELECT floor(random() * 900 + 100)::int INTO random_num;
        
        -- Combine into subdomain
        generated_subdomain := adj || '-' || noun || '-' || random_num::text;
        
        -- Check if subdomain is unique
        SELECT NOT EXISTS (
            SELECT 1 FROM public.applications WHERE subdomain = generated_subdomain
        ) INTO is_unique;
    END LOOP;
    
    RETURN generated_subdomain;
END;
$$;

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO authenticated;

GRANT SELECT ON public.subdomain_adjectives TO authenticated;

GRANT SELECT ON public.subdomain_nouns TO authenticated;

GRANT
EXECUTE ON FUNCTION public.generate_random_subdomain () TO authenticated;

-- Add comment for documentation
COMMENT ON FUNCTION public.generate_random_subdomain () IS 'Generates a random subdomain in the format adjective-noun-number';

-- Add default value to subdomain column in applications table
ALTER TABLE public.applications
ALTER COLUMN subdomain
SET DEFAULT public.generate_random_subdomain ();

-- Add unique constraint to subdomain column
ALTER TABLE public.applications
ADD CONSTRAINT unique_subdomain UNIQUE (subdomain);