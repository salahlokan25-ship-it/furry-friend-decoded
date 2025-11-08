# Database Setup Guide

## Error: relation "public.posts" does not exist

This error means the database tables haven't been created yet in your Supabase project.

## Fix: Apply Database Migration

### Step 1: Open Supabase Dashboard
1. Go to https://supabase.com/dashboard
2. Select your **PetParadise** project
3. Click on **SQL Editor** in the left sidebar

### Step 2: Run the Migration
1. Click **New Query**
2. Copy the entire content from: `supabase/migrations/20251025_community.sql`
3. Paste it into the SQL editor
4. Click **RUN** (or press Ctrl/Cmd + Enter)

### Step 3: Verify Tables Created
After running the migration, verify these tables exist:
- ✅ `public.profiles`
- ✅ `public.posts`
- ✅ `public.post_media`
- ✅ `public.likes`
- ✅ `public.comments`

You can verify by going to **Table Editor** in Supabase dashboard.

### Step 4: Create Storage Bucket
The migration also creates a storage bucket for community media. If it fails:
1. Go to **Storage** in Supabase dashboard
2. Click **Create bucket**
3. Name: `community-media`
4. Make it **Public**

### Step 5: Refresh Your App
Once the migration is applied:
1. Refresh your browser
2. The Community page should now work without errors

## Tables Created

The migration creates these tables with Row Level Security (RLS):

1. **profiles** - User profiles linked to auth
2. **posts** - Community posts
3. **post_media** - Images/videos for posts
4. **likes** - Post likes
5. **comments** - Post comments

All tables have proper RLS policies to ensure:
- Everyone can read public content
- Users can only modify their own content
- Authenticated users can create new content

## Need Help?

If you still see errors after applying the migration:
1. Check Supabase logs in the dashboard
2. Verify you're connected to the correct Supabase project
3. Make sure your `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are correct in `.env`
