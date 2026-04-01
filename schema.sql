-- Run this in your Supabase SQL Editor to configure the new Q5 application database

CREATE TABLE public.maintenance_issues (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_number text NOT NULL,
  property_name text NOT NULL,
  category text NOT NULL,
  urgency text NOT NULL,
  description text NOT NULL,
  photo_url text,
  status text DEFAULT 'Open',
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Note: In Supabase Storage, create a bucket named "maintenance-photos". 
-- Make sure to set it to "Public" so the images can be viewed on the dashboard!
