-- Showcase games shown on gotcha.land, managed from the console's admin page.
-- Applied manually in the Supabase SQL editor (additive; safe to re-run).
create table if not exists public.showcase_game (
  challenge_url varchar primary key references public.challenge (url) on delete cascade,
  site_key varchar not null references public.api_key (site_key) on delete cascade,
  label varchar not null,
  description varchar not null default '',
  preview_url varchar,
  repo varchar,
  pages_project varchar,
  position int not null default 0,
  visible boolean not null default true,
  created_at timestamptz not null default now()
);
alter table public.showcase_game enable row level security; -- only the secret key (console server) can read/write

insert into storage.buckets (id, name, public) values ('showcase', 'showcase', true) on conflict (id) do nothing;

-- Seed with the games already on gotcha.land (challenge url taken from each site key's pool).
insert into public.showcase_game (challenge_url, site_key, label, description, preview_url, position)
select (select min(challenge_url) from public.api_key_challenges_pool p where p.site_key = v.site_key), v.*
from (values
  ('vvk-j4sFsdP3G3lTn50qHMQQYLSzCGmACQo84ROdPsL8ZMuYddnMfd7Ne4u9YMeZ', 'Skyfall', 'Catch the wind, glide through three gates, and land among the floating islands.', 'https://gotcha.land/images/skyfall-preview.jpg', 0),
  ('bez-LH4AZy_u3txDktRW3lHjTr6XOc3tZRuK-vQSjtidva5FWCCUFWsuZSVv2WID', 'Ninja Leap', 'Track the target with natural mouse or touch movement to complete the CAPTCHA.', 'https://gotcha.land/images/ninja-preview.png', 1),
  ('A6d6UFna6XwCNeqP-Hdbga9swMHaE4Ka4GkGWZhjUYGs80MWDnn-HU8OpjFfeL7H', 'SpaceX IPO', 'Tudemuuuuuuuun IPO', 'https://gotcha.land/images/spacexipo-preview.png', 2),
  ('-oQC6YwZY4kvnUiEsqOXoULoVdNqGCZMPgLvp3zpoEMjvzziHGfDlWmGil968PKM', 'Runner Game', 'Collect the letters and finish the run to clear the challenge in one quick pass.', 'https://gotcha.land/images/runner-preview.png', 3),
  ('RmQ8i838KTF8uLQZKmUA4hMPyO7-0RlmGMUV_uWr3cVDEYrX4plzUub84n1ct7UR', 'Matrix Runner', 'Dodge the agents, finish the run, and turn a normal CAPTCHA moment into something memorable.', 'https://gotcha.land/images/matrix-runner-preview.png', 4),
  ('dO7NLA7f_we1AOP9uicewVG4UwalvCq8aCCgnlbwdON9iMZdy1ew2Z54sO6Wn29k', 'Tune Radio', 'Tune the signal into the safe band before the lock times out.', 'https://gotcha.land/images/tune-radio-preview.png', 5),
  ('jA_SMEHpd0fJh25-bqYsK_v0z6p8S6J17QsCnzMUgDgUksJ8l2lUU0Y_qOuo4GbQ', 'Hot Air Baloon', 'Steer the balloon through the sky while avoiding drifting obstacles.', 'https://gotcha.land/images/hot-air-baloon.png', 6),
  ('xAUSi2k8x8AYUaAj1gjmwdanLhLe09pAecEpk3y2RHIAcrTc1ImdubiDAEye2d7p', 'Dragon', 'Guide the dragon to safety before the patrol closes in.', 'https://gotcha.land/images/dragon-preview.png', 7),
  ('OwsPNpF9tjTiYC89G884LN-81IbmkL63sDF2zGOje-8C_MOtVpGX0QVc-RugksX-', 'Differences', 'Spot the changed shapes between two panels before time runs out.', 'https://gotcha.land/images/differences-preview.png', 8)
) as v(site_key, label, description, preview_url, position)
on conflict (challenge_url) do nothing;

-- Remember the Cloudflare Pages project for games hosted on *.pages.dev (enables deploy status + redeploy).
update public.showcase_game
set pages_project = split_part(split_part(challenge_url, '//', 2), '.pages.dev', 1)
where pages_project is null and challenge_url like 'https://%.pages.dev/%';
update public.showcase_game set pages_project = 'game-runner' where pages_project = 'game-runner-4yg'; -- subdomain differs from project name
update public.showcase_game set pages_project = 'game-skyfall' where challenge_url = 'https://skyfall.gotcha.land/'; -- custom domain
