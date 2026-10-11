# The Embrione — Web Development Domain Recruitment Challenge

A full-stack "Meet The Team" onboarding and moderation system built for The Embrione's Web Development domain recruitment challenge. It has a member registration form with a live card preview, an admin moderation dashboard, and a public team directory.

**Live site:** https://YOUR-SUBDOMAIN-embrione-task.vercel.app
**Demo video:** YOUR_VIDEO_LINK

## Features
- Registration form with a real-time member card preview
- Client-side WebP conversion (max 800px, quality 0.8) before upload to Supabase Storage
- Image is uploaded only when the form is submitted, not while previewing
- Duplicate SRN check, so the same student cannot submit twice
- Admin dashboard with counters (Total, Pending, Approved) and Approve, Reject and Delete actions
- Public team directory showing only approved members, with Domain and Position filters
- Fully responsive, dark theme, with subtle animations that respect reduced-motion settings

## Technologies Used
- Next.js (App Router)
- Tailwind CSS
- Shadcn UI (components and Sonner for toasts)
- Motion (animations)
- Supabase (PostgreSQL + Storage)
- Browser Image Compression (client-side WebP conversion)

## Setup Instructions

### 1. Supabase Setup
1. Create a free account at [Supabase](https://supabase.com).
2. Create a new project.
3. In your Supabase project, go to **SQL Editor** and run the contents of the `supabase-setup.sql` file provided in this repository. This will:
   - Create the `members` table.
   - Set up Row Level Security (RLS) policies.
   - Seed the database with 5 mock profiles.
4. Go to **Storage**, create a new public bucket named `member-photos`, and ensure it is set to **Public**.
5. If uploads fail with a permissions error, allow public uploads to the bucket by running this in the SQL Editor:
```sql
   create policy "Allow public uploads" on storage.objects
   for insert with check (bucket_id = 'member-photos');
```

### 2. Local Environment Setup
1. Create a `.env.local` file in the root directory (you can copy `.env.example` if available).
2. Add your Supabase credentials:
```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```
3. Install dependencies:
```bash
   npm install
```
4. Run the development server:
```bash
   npm run dev
```
   Open [http://localhost:3000](http://localhost:3000) in your browser.

### 3. Vercel Deployment
1. Push this code to a public GitHub repository.
2. Go to [Vercel](https://vercel.com) and import the repository.
3. Name the project `<yourfirstname>-embrione-task` so the URL matches the required format.
4. Before deploying, add `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in the **Environment Variables** section of the Vercel project settings.
5. Deploy. If you add the variables after deploying, redeploy so they take effect.

## Pages Overview
- **`/`**: Landing page with the club intro and a live member count.
- **`/register`**: Candidate registration page with a dynamic live preview and automatic client-side WebP conversion for uploaded images.
- **`/admin`**: Protected dashboard to review pending members. Approving a member makes them visible on the team directory. (Login: `admin@embrione.pes.edu` / `EmbrioneAdmin@2026`)
- **`/team`**: Public directory showcasing approved members, including filters by Domain and Position.

## How It Works
- A new submission is saved to the `members` table with `status = 'pending'`.
- The admin changes the status to `approved` or `rejected`.
- The `/team` page queries only rows where `status = 'approved'`.

## Project Structure
```
src/
  app/
    page.tsx            Landing page
    register/page.tsx   Registration form and live preview
    admin/page.tsx      Admin login and moderation
    team/page.tsx       Public team directory
  components/
    MemberCard.tsx      Member card used in the preview and the directory
    Navbar.tsx
  lib/
    supabaseClient.ts   Supabase client
    motion.ts           Shared animation easing
```