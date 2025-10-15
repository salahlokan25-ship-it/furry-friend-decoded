-- Make profile-images storage bucket private for better security
UPDATE storage.buckets 
SET public = false 
WHERE id = 'profile-images';