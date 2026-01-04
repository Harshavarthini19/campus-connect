-- Enable realtime for issues table
ALTER TABLE public.issues REPLICA IDENTITY FULL;
ALTER PUBLICATION supabase_realtime ADD TABLE public.issues;