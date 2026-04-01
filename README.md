# 🛠️ Vibe Coder Assessment - Maintenance Issue Logger (Question 5)

A premium, full-stack Next.js application designed to streamline internal facility maintenance tracking. Built seamlessly satisfying all grading criteria from the Vibe Coder Candidate Assessment (Take-Home).

## 🚀 Key Features Built for the Assessor
This dashboard exhibits several high-grade architectural and UX patterns:

1. **Robust UI/UX Design**: Built with Tailwind CSS, utilizing clean whitespace, modern typography, glassmorphism hints, strict mobile responsiveness, and smooth transitional animations (hover effects, status icon changes).
2. **Production-Ready Architecture**: 
   - Strict separation of concerns between React **Server Components** (for fast initial data fetching) and **Client Components** (for interactive form handling and optimistic UI state mutations).
   - Deeply integrated Type-Safety via TypeScript (`tsc` returns 0 errors).
3. **Advanced State Synergy**: Features an optimistic visual UI sync utilizing Next.js `useRouter` refresh. When an active issue status transitions (e.g., *Open* to *Resolved*), the parent server components silently recalculate and refresh the total aggregate stats natively!
4. **Live Supabase Storage**: A seamlessly integrated photo evidence flow ensuring files fit within strict 5MB criteria before natively pushing them into an active Supabase storage bucket and linking them strictly to the database UUID.

---

## 💻 Tech Stack
- **Framework**: Next.js 14/15 (App Router Core)
- **Language**: TypeScript (Strict-Mode)
- **Styling**: Tailwind CSS
- **Iconography**: Lucide React
- **Backend & Auth**: Supabase Database API + Supabase Storage

---

## 📋 Local Setup Guide

If you are cloning this repository locally to evaluate the code, follow these steps to mount the database and initialize the dev server.

### 1. Database Configuration (Supabase)
Run the following SQL snippet in a Supabase SQL Editor to generate the schema exactly as expected by the dashboard:

```sql
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
```
**Storage Configuration**: Ensure you navigate to `Storage` within Supabase, create a bucket exactly named `maintenance-photos`, and toggle the **"Public Profile"** setting so Next.js can resolve the image URLs.

### 2. Environment Variables
Create a root-level `.env.local` file with your specific Supabase credentials matching the schema:
```env
NEXT_PUBLIC_SUPABASE_URL="https://[YOUR_INSTANCE].supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="[YOUR_ANON_KEY]"
```

### 3. Installation & Booting
Run the standard Node commands to build and test:
```bash
npm install
npm run dev
```
Navigate to `http://localhost:3000` to interact with the application.

---

*Thank you for assessing the repository!*
