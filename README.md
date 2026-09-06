# Dynamic QR Code Management System

A production-quality SaaS web application that enables users to generate, manage, and track **Dynamic QR Codes**.

Dynamic QR codes encode a permanent, immutable redirect URL:
```
https://YOUR_DOMAIN.com/q/ABC123
```
When printed on physical assets (packaging, posters, business cards, merchandise), the physical QR code **never needs to be reprinted**. Changing the destination URL in the dashboard updates where the QR points immediately in real-time.

---

## 1. Project Overview & Core Concept

Unlike static QR codes (which directly bake the target URL into the matrix), a **Dynamic QR Code** delegates destination resolution to a cloud database:

```
[ Physical Printed QR ]
         │
         ▼
 permanent URL: https://yourdomain.com/q/ABC123
         │
         ▼
 [ Cloud Database / Supabase ]
   • Validates active status
   • Increments atomic scan_count
   • Resolves latest destination_url
         │
         ▼
 [ Target Destination ] (e.g. https://example.com/product-2)
```

If you change the destination from `product-1` to `product-2` in your dashboard, the printed QR continues to work immediately, directing scanners to `product-2`.

---

## 2. Tech Stack

- **Frontend**: React 18, TypeScript, Vite
- **Styling**: Tailwind CSS (Dark theme, Glassmorphism, Responsive)
- **Icons**: Lucide React
- **QR Generation**: `qrcode` (Supports high-resolution 1024x1024 PNG and vector SVG)
- **QR Scanning**: `html5-qrcode` (Live device camera + image file upload)
- **Database & Auth**: Supabase PostgreSQL, Supabase Auth, Row Level Security (RLS)
- **Routing**: React Router v6
- **Deployment**: Vercel-ready with Single Page Application rewrites (`vercel.json`)

---

## 3. Quick Start (Local Development)

The application includes an **instant local demo mode**. You can run and test all dynamic features immediately without needing to configure a remote Supabase project first.

```bash
# 1. Install dependencies
npm install

# 2. Start the local Vite development server
npm run dev

# 3. Build for production
npm run build
```

Open your browser at:
`http://localhost:5173`

---

## 4. Supabase Setup & Database SQL

When you are ready to connect a live Supabase project:

1. Create a project on [Supabase.com](https://supabase.com).
2. Go to **SQL Editor** in your Supabase project dashboard.
3. Paste and run the complete schema script located in `supabase/schema.sql` (or copy below):

```sql
-- 1. Create dynamic_qrs table
CREATE TABLE IF NOT EXISTS public.dynamic_qrs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    qr_code TEXT UNIQUE NOT NULL,
    title TEXT,
    destination_url TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
    scan_count INTEGER NOT NULL DEFAULT 0 CHECK (scan_count >= 0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Performance indexes
CREATE INDEX IF NOT EXISTS idx_dynamic_qrs_qr_code ON public.dynamic_qrs (qr_code);
CREATE INDEX IF NOT EXISTS idx_dynamic_qrs_user_id ON public.dynamic_qrs (user_id);
CREATE INDEX IF NOT EXISTS idx_dynamic_qrs_status ON public.dynamic_qrs (status);

-- 3. Automatic updated_at trigger
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tr_dynamic_qrs_updated_at ON public.dynamic_qrs;
CREATE TRIGGER tr_dynamic_qrs_updated_at
    BEFORE UPDATE ON public.dynamic_qrs
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Secure RPC function to increment scan count without giving anon direct UPDATE table access
CREATE OR REPLACE FUNCTION public.increment_scan_count(qr_code_param TEXT)
RETURNS VOID AS $$
BEGIN
    UPDATE public.dynamic_qrs
    SET scan_count = scan_count + 1
    WHERE qr_code = qr_code_param AND status = 'active';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Enable Row Level Security (RLS)
ALTER TABLE public.dynamic_qrs ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
CREATE POLICY "Users can view their own dynamic_qrs"
    ON public.dynamic_qrs FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own dynamic_qrs"
    ON public.dynamic_qrs FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own dynamic_qrs"
    ON public.dynamic_qrs FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own dynamic_qrs"
    ON public.dynamic_qrs FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Public can view dynamic_qrs for redirection"
    ON public.dynamic_qrs FOR SELECT TO anon
    USING (true);

GRANT EXECUTE ON FUNCTION public.increment_scan_count(TEXT) TO anon, authenticated;
```

---

## 5. Environment Variables

Create or update `.env` in the project root:

```env
# Supabase Project Credentials (from Project Settings > API)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here

# Base URL for Dynamic QR Redirects
# Local dev: http://localhost:5173
# Production: https://your-custom-domain.com or https://your-app.vercel.app
VITE_APP_URL=http://localhost:5173
```

> **Security Note:** Never expose your Supabase `service_role` key in frontend code. Only use the public `anon` key.

---

## 6. Application Routes

| Route | Purpose | Access |
|---|---|---|
| `/` | Landing page explaining the dynamic QR architecture | Public |
| `/login` | Supabase Auth (Sign in, Sign up) & Demo guest access | Public |
| `/dashboard` | QR Codes table, statistics, search, filters & quick actions | Authenticated |
| `/qr/create` | Dynamic QR creation wizard with live preview & PNG/SVG exports | Authenticated |
| `/qr/:id` | QR details page: update destination, toggle status, view analytics | Authenticated |
| `/scanner` | Testing suite with camera and file upload to test dynamic redirect | Public |
| `/q/:code` | The permanent dynamic redirect endpoint | Public |

---

## 7. Dynamic Redirect Mechanism (`/q/:code`)

When a user or device scans a QR code:
1. The browser requests `GET /q/:code`.
2. The page extracts `:code` (e.g. `ABC123`).
3. Supabase is queried for `qr_code = 'ABC123'`.
4. **Behavior Checks**:
   - **QR does not exist**: Displays a clean "QR Code Not Found" (404) page.
   - **QR is inactive**: Displays a clean "QR Code Inactive" page informing the user.
   - **QR is active**: The `increment_scan_count` RPC function increments the scan counter atomically, and the browser redirects to the current `destination_url`.

---

## 8. Step-by-Step Testing of the Printed QR Workflow

Follow this procedure to verify that the physical QR code continues working after destination changes:

1. **Create the QR Code**:
   - Navigate to `/qr/create`.
   - Title: `Product Showcase`.
   - Destination URL: `https://example.com/product-1`.
   - Custom ID (or auto-generated): `DEMO123`.
   - Click **Generate Dynamic QR**.
   - Download the PNG or SVG.

2. **Verify Initial Redirection**:
   - Go to `/scanner`.
   - Either scan the downloaded QR image (or click `Scan DEMO123`).
   - Notice the resolved destination: `https://example.com/product-1`.
   - Click **Open Destination via Dynamic Redirect**. Confirm it loads `product-1`.

3. **Change Destination (DO NOT REGENERATE QR)**:
   - In `/dashboard` or `/qr/:id`, edit the destination URL to `https://example.com/product-2`.
   - Click **Save Changes**.
   - Note: The physical QR image is **100% identical** because it encodes `/q/DEMO123`.

4. **Verify Dynamic Redirection**:
   - Go back to `/scanner`.
   - Scan the **exact same** original downloaded QR image.
   - Notice that the scanner now resolves destination to `https://example.com/product-2`.
   - Click **Open Destination via Dynamic Redirect**. Confirm `product-2` loads.
   - Observe that the scan count in the dashboard has incremented!

---

## 9. Deployment to Vercel

1. Push your repository to GitHub / GitLab.
2. Import the repository in [Vercel](https://vercel.com).
3. In Project Settings > Environment Variables, add:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_ANON_KEY`
   - `VITE_APP_URL` (set to your Vercel URL, e.g., `https://your-project.vercel.app`)
4. The included `vercel.json` automatically handles SPA routing rewrites for `/q/:code` and all dashboard subroutes.
5. Click **Deploy**.
