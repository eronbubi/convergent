-- Claudemotion — database schema
-- Run this once in the Supabase SQL editor (Dashboard → SQL → New query → paste → Run).
-- It is idempotent where practical, so running it again is safe.

create extension if not exists pg_trgm with schema extensions;

-- ─────────────────────────────────────────────────────────────
-- Profiles
-- ─────────────────────────────────────────────────────────────
create table if not exists public.profiles (
  id           uuid primary key references auth.users (id) on delete cascade,
  username     text not null unique
               check (username ~ '^[a-z0-9_.]{3,24}$'),
  display_name text not null default ''
               check (char_length(display_name) <= 48),
  bio          text not null default ''
               check (char_length(bio) <= 280),
  created_at   timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "Profiles are public" on public.profiles;
create policy "Profiles are public"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "Users update their own profile" on public.profiles;
create policy "Users update their own profile"
  on public.profiles for update
  to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

-- Only display name and bio are editable by the owner.
revoke update on public.profiles from anon, authenticated;
grant update (display_name, bio) on public.profiles to authenticated;

-- Create a profile row for every new auth user, using the username chosen at sign-up.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  wanted text := lower(coalesce(new.raw_user_meta_data ->> 'username', ''));
  final  text;
begin
  if wanted !~ '^[a-z0-9_.]{3,24}$' then
    wanted := 'user' || substr(replace(new.id::text, '-', ''), 1, 8);
  end if;

  final := wanted;
  while exists (select 1 from public.profiles where username = final) loop
    final := left(wanted, 19) || '_' || substr(md5(random()::text), 1, 4);
  end loop;

  insert into public.profiles (id, username, display_name)
  values (
    new.id,
    final,
    left(coalesce(nullif(new.raw_user_meta_data ->> 'display_name', ''), final), 48)
  );
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Username availability check used by the sign-up form.
create or replace function public.username_available(p_username text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select lower(p_username) ~ '^[a-z0-9_.]{3,24}$'
     and not exists (select 1 from public.profiles where username = lower(p_username));
$$;

grant execute on function public.username_available(text) to anon, authenticated;

-- True when the current user has confirmed their email address.
create or replace function public.is_verified()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from auth.users
    where id = auth.uid() and email_confirmed_at is not null
  );
$$;

-- ─────────────────────────────────────────────────────────────
-- Posts
-- ─────────────────────────────────────────────────────────────
create table if not exists public.posts (
  id                 uuid primary key default gen_random_uuid(),
  author_id          uuid not null references public.profiles (id) on delete cascade,
  title              text not null check (char_length(title) between 1 and 120),
  prompt             text not null check (char_length(prompt) between 1 and 4000),
  -- The clip, and a still frame picked from it that is shown as the post's photo.
  media_path         text not null,
  poster_path        text not null,
  duration_seconds   numeric(7, 2) check (duration_seconds > 0),
  width              integer not null check (width > 0),
  height             integer not null check (height > 0),
  model_used         text not null check (char_length(model_used) between 1 and 80),
  recommended_models text[] not null default '{}'
                     check (cardinality(recommended_models) <= 8),
  prompt_engineer    text not null check (char_length(prompt_engineer) between 1 and 60),
  tags               text[] not null check (cardinality(tags) between 1 and 6),
  copy_count         integer not null default 0,
  created_at         timestamptz not null default now()
);

create index if not exists posts_created_at_idx on public.posts (created_at desc);
create index if not exists posts_copy_count_idx on public.posts (copy_count desc);
create index if not exists posts_author_idx on public.posts (author_id, created_at desc);
create index if not exists posts_tags_idx on public.posts using gin (tags);
create index if not exists posts_title_trgm_idx on public.posts using gin (title extensions.gin_trgm_ops);

alter table public.posts enable row level security;

drop policy if exists "Posts are public" on public.posts;
create policy "Posts are public"
  on public.posts for select
  to anon, authenticated
  using (true);

drop policy if exists "Verified users create their own posts" on public.posts;
create policy "Verified users create their own posts"
  on public.posts for insert
  to authenticated
  with check ((select auth.uid()) = author_id and (select public.is_verified()));

drop policy if exists "Authors delete their own posts" on public.posts;
create policy "Authors delete their own posts"
  on public.posts for delete
  to authenticated
  using ((select auth.uid()) = author_id);

-- Nobody edits posts through the API (copy_count is maintained by record_prompt_copy).
revoke update on public.posts from anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Prompt copies (one row per person/device per post)
-- ─────────────────────────────────────────────────────────────
create table if not exists public.prompt_copies (
  post_id    uuid not null references public.posts (id) on delete cascade,
  client_key text not null,
  user_id    uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  primary key (post_id, client_key)
);

create index if not exists prompt_copies_user_idx on public.prompt_copies (user_id);

alter table public.prompt_copies enable row level security;

drop policy if exists "Users read their own copies" on public.prompt_copies;
create policy "Users read their own copies"
  on public.prompt_copies for select
  to authenticated
  using ((select auth.uid()) = user_id);

-- Records that someone copied a prompt and returns the new count.
-- Signed-in users are identified by their id. Anonymous visitors are only counted
-- when the call comes from the server with the secret key (the app's /api/copy route),
-- so the count can't be inflated by calling the API directly with made-up keys.
create or replace function public.record_prompt_copy(p_post_id uuid, p_client_key text default null)
returns integer
language plpgsql
security definer
set search_path = ''
as $$
declare
  k      text;
  author uuid;
  result integer;
begin
  select author_id into author from public.posts where id = p_post_id;
  if author is null then
    return 0;
  end if;

  if auth.uid() is not null then
    if auth.uid() = author then
      select copy_count into result from public.posts where id = p_post_id;
      return result;
    end if;
    k := 'u:' || auth.uid()::text;
  elsif coalesce(auth.role(), '') = 'service_role'
        and p_client_key ~ '^[A-Za-z0-9-]{16,64}$' then
    k := 'a:' || p_client_key;
  else
    select copy_count into result from public.posts where id = p_post_id;
    return result;
  end if;

  insert into public.prompt_copies (post_id, client_key, user_id)
  values (p_post_id, k, auth.uid())
  on conflict do nothing;

  if found then
    update public.posts set copy_count = copy_count + 1
    where id = p_post_id
    returning copy_count into result;
  else
    select copy_count into result from public.posts where id = p_post_id;
  end if;

  return result;
end;
$$;

revoke execute on function public.record_prompt_copy(uuid, text) from public;
grant execute on function public.record_prompt_copy(uuid, text) to anon, authenticated, service_role;

-- ─────────────────────────────────────────────────────────────
-- Read model used by the feed, post pages and search
-- ─────────────────────────────────────────────────────────────
drop view if exists public.post_cards cascade;
create view public.post_cards
with (security_invoker = true)
as
select
  p.id,
  p.title,
  p.prompt,
  p.media_path,
  p.poster_path,
  p.duration_seconds,
  p.width,
  p.height,
  p.model_used,
  p.recommended_models,
  p.prompt_engineer,
  eng.username      as engineer_username,
  p.tags,
  p.copy_count,
  p.created_at,
  p.author_id,
  a.username        as author_username,
  a.display_name    as author_display_name
from public.posts p
join public.profiles a on a.id = p.author_id
left join public.profiles eng on eng.username = lower(ltrim(p.prompt_engineer, '@'));

grant select on public.post_cards to anon, authenticated;

-- Feed: 'for-you' (copies + freshness + the tags you copy most), 'latest' or 'top'.
create or replace function public.feed_posts(
  p_mode   text default 'for-you',
  p_tag    text default null,
  p_limit  integer default 24,
  p_offset integer default 0
)
returns setof public.post_cards
language sql
stable
set search_path = public
as $$
  with viewer_tags as (
    select t.tag, count(*)::float8 as w
    from public.prompt_copies c
    join public.posts p on p.id = c.post_id
    cross join lateral unnest(p.tags) as t(tag)
    where auth.uid() is not null and c.user_id = auth.uid()
    group by t.tag
  )
  select pc.*
  from public.post_cards pc
  where p_tag is null or p_tag = any (pc.tags)
  order by
    case when p_mode = 'latest' then pc.created_at end desc nulls last,
    case when p_mode = 'top' then pc.copy_count end desc nulls last,
    case when p_mode not in ('latest', 'top') then
        ln(1 + pc.copy_count) * 1.2
      + coalesce((select ln(1 + sum(vt.w)) from viewer_tags vt where vt.tag = any (pc.tags)), 0) * 1.5
      + 4.0 * exp(-extract(epoch from (now() - pc.created_at)) / (3600.0 * 72))
    end desc nulls last,
    pc.created_at desc,
    pc.id
  limit least(greatest(p_limit, 1), 48)
  offset greatest(p_offset, 0);
$$;

grant execute on function public.feed_posts(text, text, integer, integer) to anon, authenticated;

-- Search posts by title, tag, prompt, author or prompt engineer.
create or replace function public.search_posts(q text, p_limit integer default 24, p_offset integer default 0)
returns setof public.post_cards
language sql
stable
set search_path = public
as $$
  with term as (
    select '%' || replace(replace(replace(trim(q), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pat,
           '%' || replace(lower(trim(q)), ' ', '-') || '%' as tag_pat
  )
  select pc.*
  from public.post_cards pc, term
  where length(trim(q)) > 0
    and (
         pc.title ilike term.pat
      or pc.prompt ilike term.pat
      or pc.author_username ilike term.pat
      or pc.prompt_engineer ilike term.pat
      or pc.model_used ilike term.pat
      or exists (select 1 from unnest(pc.tags) t where t ilike term.tag_pat)
    )
  order by (pc.title ilike term.pat) desc, pc.copy_count desc, pc.created_at desc
  limit least(greatest(p_limit, 1), 48)
  offset greatest(p_offset, 0);
$$;

grant execute on function public.search_posts(text, integer, integer) to anon, authenticated;

-- Search people by username or display name, with their post count.
create or replace function public.search_profiles(q text, p_limit integer default 8)
returns table (username text, display_name text, post_count bigint)
language sql
stable
set search_path = public
as $$
  with term as (
    select '%' || replace(replace(replace(trim(q), '\', '\\'), '%', '\%'), '_', '\_') || '%' as pat
  )
  select pr.username, pr.display_name,
         (select count(*) from public.posts p where p.author_id = pr.id) as post_count
  from public.profiles pr, term
  where length(trim(q)) > 0
    and (pr.username ilike term.pat or pr.display_name ilike term.pat)
  order by (pr.username ilike trim(q) || '%') desc, post_count desc, pr.username
  limit least(greatest(p_limit, 1), 24);
$$;

grant execute on function public.search_profiles(text, integer) to anon, authenticated;

-- Post counts per tag (for the tag index).
create or replace function public.tag_counts()
returns table (tag text, post_count bigint)
language sql
stable
set search_path = public
as $$
  select t.tag, count(*) as post_count
  from public.posts p
  cross join lateral unnest(p.tags) as t(tag)
  group by t.tag
  order by post_count desc;
$$;

grant execute on function public.tag_counts() to anon, authenticated;

-- Model names people have already typed, most used first (autocomplete in the upload form).
create or replace function public.used_models(p_limit integer default 40)
returns table (model text, uses bigint)
language sql
stable
set search_path = public
as $$
  select m.model, count(*) as uses
  from (
    select model_used as model from public.posts
    union all
    select unnest(recommended_models) from public.posts
  ) m
  group by m.model
  order by uses desc, m.model
  limit least(greatest(p_limit, 1), 200);
$$;

grant execute on function public.used_models(integer) to anon, authenticated;

-- Site-wide numbers shown on the home page.
create or replace function public.site_stats()
returns table (posts bigint, engineers bigint, copies bigint)
language sql
stable
security definer
set search_path = ''
as $$
  select
    (select count(*) from public.posts),
    (select count(distinct author_id) from public.posts),
    (select coalesce(sum(copy_count), 0) from public.posts);
$$;

grant execute on function public.site_stats() to anon, authenticated;

-- ─────────────────────────────────────────────────────────────
-- Storage: public "media" bucket, users write only inside their own folder
-- ─────────────────────────────────────────────────────────────
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'media', 'media', true, 52428800,
  -- Clips, plus the JPEG stills the upload form takes from them.
  array['video/mp4', 'video/webm', 'video/quicktime', 'image/jpeg', 'image/webp']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "Users upload into their own folder" on storage.objects;
create policy "Users upload into their own folder"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
    and (select public.is_verified())
  );

-- Removing files through the API needs select as well as delete.
drop policy if exists "Users read their own files" on storage.objects;
create policy "Users read their own files"
  on storage.objects for select
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );

drop policy if exists "Users delete their own files" on storage.objects;
create policy "Users delete their own files"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'media'
    and (storage.foldername(name))[1] = (select auth.uid())::text
  );
