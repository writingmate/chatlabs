update postgres.public.prompts set slug = slugify(name) + sequence; ;
update postgres.public.prompt_category set slug = slugify(name);
