CREATE POLICY "Pro subscription required to access all models"
    ON messages FOR INSERT TO authenticated WITH CHECK
    (model IN
     ('gpt-3.5-turbo', 'mistral-tiny', 'pplx-7b-chat', 'pplx-7b-instruct', 'mistral-7b-instruct') or
     user_id in (SELECT user_id
                 FROM profiles
                 WHERE user_id = auth.uid()::uuid
                   and plan like 'pro_%'));

