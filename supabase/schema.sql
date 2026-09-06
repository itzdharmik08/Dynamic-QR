-- ==============================================================================
-- Dynamic QR Code Management System - Supabase Schema
-- ==============================================================================

-- 1. Create the dynamic_qrs table
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

-- 3. Automatic updated_at timestamp trigger
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

-- 4. Secure RPC function to increment scan count without giving public UPDATE table privileges
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
-- A. Authenticated users can view their own QR codes
CREATE POLICY "Users can view their own dynamic_qrs"
    ON public.dynamic_qrs
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

-- B. Authenticated users can insert their own QR codes
CREATE POLICY "Users can create their own dynamic_qrs"
    ON public.dynamic_qrs
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

-- C. Authenticated users can update their own QR codes
CREATE POLICY "Users can update their own dynamic_qrs"
    ON public.dynamic_qrs
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- D. Authenticated users can delete their own QR codes
CREATE POLICY "Users can delete their own dynamic_qrs"
    ON public.dynamic_qrs
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- E. Public (anon) can read QR codes for the dynamic redirect route /q/:code
-- Note: We allow anon to select so the frontend can check both active status and display 'inactive' message if inactive
CREATE POLICY "Public can view dynamic_qrs for redirection"
    ON public.dynamic_qrs
    FOR SELECT
    TO anon
    USING (true);

-- Grant execute on the increment scan function to anon and authenticated
GRANT EXECUTE ON FUNCTION public.increment_scan_count(TEXT) TO anon, authenticated;
