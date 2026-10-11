-- 1. Create the members table
create table public.members (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  domain text not null,
  position text not null,
  srn text not null,
  email text not null,
  linkedin_url text,
  github_url text,
  branch text not null,
  semester integer not null,
  bio text,
  photo_url text not null,
  status text not null default 'pending', -- 'pending', 'approved', 'rejected'
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Quick policy to allow public inserts & reading
alter table public.members enable row level security;

create policy "Allow public insert" on public.members for insert with check (true);
create policy "Allow public read" on public.members for select using (true);
create policy "Allow admin updates" on public.members for update using (true);
create policy "Allow admin deletes" on public.members for delete using (true);

-- 2. Seed Mock Data
insert into public.members (name, domain, position, srn, email, linkedin_url, github_url, branch, semester, bio, photo_url, status)
values
  ('Alex Johnson', 'Web Development', 'Head', 'PES1UG21CS001', 'alex.j@pes.edu', 'https://linkedin.com/in/alex', 'https://github.com/alex', 'CSE', 5, 'Passionate about building fast, accessible web applications and teaching others the joy of coding.', 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&q=80', 'approved'),
  ('Sarah Smith', 'Design', 'Core Member', 'PES1UG22EC002', 'sarah.s@pes.edu', 'https://linkedin.com/in/sarah', '', 'ECE', 3, 'UI/UX enthusiast. I believe good design is invisible. Constantly exploring new trends in digital product design.', 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=800&q=80', 'approved'),
  ('David Chen', 'Logistics', 'Vice-Head', 'PES1UG21ME003', 'david.c@pes.edu', '', '', 'ME', 5, 'Master of organization and making sure things happen when they are supposed to. Love problem solving.', 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=800&q=80', 'approved'),
  ('Priya Sharma', 'Social Media', 'Member', 'PES1UG23CS004', 'priya.s@pes.edu', 'https://linkedin.com/in/priya', '', 'CSE', 1, 'Creative thinker with a knack for storytelling. I help our team connect with the audience online.', 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=800&q=80', 'approved'),
  ('Michael Torres', 'Event Management', 'Core Member', 'PES1UG22BT005', 'michael.t@pes.edu', '', 'https://github.com/michaelt', 'Biotech', 3, 'Love bringing people together through well-organized events. Always ready for a new challenge.', 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=800&q=80', 'approved');
