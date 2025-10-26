-- Community feature schema

-- Enable required extensions
create extension if not exists "pgcrypto";

-- Profiles table mirrors auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  avatar_url text,
  created_at timestamp with time zone default now()
);

alter table public.profiles enable row level security;

-- Posts
create table if not exists public.posts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text,
  created_at timestamp with time zone default now()
);

alter table public.posts enable row level security;

-- Post media (images/videos)
create table if not exists public.post_media (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  url text not null,
  media_type text not null check (media_type in ('image','video')),
  created_at timestamp with time zone default now()
);

alter table public.post_media enable row level security;

-- Likes
create table if not exists public.likes (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  created_at timestamp with time zone default now(),
  primary key (user_id, post_id)
);

alter table public.likes enable row level security;

-- Comments
create table if not exists public.comments (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  content text not null,
  created_at timestamp with time zone default now()
);

alter table public.comments enable row level security;

-- RLS Policies
-- profiles: anyone can read; users can insert/update their own row
create policy if not exists "Profiles are viewable by everyone" on public.profiles
  for select using (true);

create policy if not exists "Users can insert their own profile" on public.profiles
  for insert with check (auth.uid() = id);

create policy if not exists "Users can update own profile" on public.profiles
  for update using (auth.uid() = id);

-- posts: readable by all; insert/update/delete by owner
create policy if not exists "Posts are viewable by everyone" on public.posts
  for select using (true);

create policy if not exists "Authenticated users can insert posts" on public.posts
  for insert with check (auth.uid() = user_id);

create policy if not exists "Users can update own posts" on public.posts
  for update using (auth.uid() = user_id);

create policy if not exists "Users can delete own posts" on public.posts
  for delete using (auth.uid() = user_id);

-- post_media: readable by all; only owners of parent post can modify
create policy if not exists "Post media are viewable by everyone" on public.post_media
  for select using (true);

create policy if not exists "Owners can insert post media" on public.post_media
  for insert with check (
    exists (
      select 1 from public.posts p
      where p.id = post_id and p.user_id = auth.uid()
    )
  );

create policy if not exists "Owners can modify post media" on public.post_media
  for update using (
    exists (
      select 1 from public.posts p
      where p.id = post_id and p.user_id = auth.uid()
    )
  );

create policy if not exists "Owners can delete post media" on public.post_media
  for delete using (
    exists (
      select 1 from public.posts p
      where p.id = post_id and p.user_id = auth.uid()
    )
  );

-- likes: readable by all; users can like/unlike themselves
create policy if not exists "Likes are viewable by everyone" on public.likes
  for select using (true);

create policy if not exists "Users can like" on public.likes
  for insert with check (auth.uid() = user_id);

create policy if not exists "Users can unlike" on public.likes
  for delete using (auth.uid() = user_id);

-- comments: readable by all; insert by authenticated; update/delete by owner
create policy if not exists "Comments are viewable by everyone" on public.comments
  for select using (true);

create policy if not exists "Users can comment" on public.comments
  for insert with check (auth.uid() = user_id);

create policy if not exists "Users can update own comments" on public.comments
  for update using (auth.uid() = user_id);

create policy if not exists "Users can delete own comments" on public.comments
  for delete using (auth.uid() = user_id);

-- Storage bucket for media
select storage.create_bucket('community-media', public := true);

-- Storage RLS policies are managed via SQL helpers in storage schema
-- Allow public read and authenticated write to own folder
-- Objects table name is storage.objects
create policy if not exists "Public can read community media" on storage.objects
  for select using ( bucket_id = 'community-media' );

create policy if not exists "Users can upload to their folder" on storage.objects
  for insert with check (
    bucket_id = 'community-media' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy if not exists "Users can update their media" on storage.objects
  for update using (
    bucket_id = 'community-media' and (storage.foldername(name))[1] = auth.uid()::text
  );

create policy if not exists "Users can delete their media" on storage.objects
  for delete using (
    bucket_id = 'community-media' and (storage.foldername(name))[1] = auth.uid()::text
  );
