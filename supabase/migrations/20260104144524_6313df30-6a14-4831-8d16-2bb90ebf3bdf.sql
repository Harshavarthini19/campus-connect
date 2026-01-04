-- Fix security issue: Restrict profiles table to authenticated users only
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

CREATE POLICY "Authenticated users can view profiles" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Fix security issue: Restrict issues table to authenticated users only
DROP POLICY IF EXISTS "Anyone can view issues" ON public.issues;

CREATE POLICY "Authenticated users can view issues" 
ON public.issues 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

-- Also restrict comments to authenticated users
DROP POLICY IF EXISTS "Anyone can view comments" ON public.comments;

CREATE POLICY "Authenticated users can view comments" 
ON public.comments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);