CREATE POLICY "Allow view access to tools with sharing link" ON tools FOR
SELECT USING (sharing = 'link');