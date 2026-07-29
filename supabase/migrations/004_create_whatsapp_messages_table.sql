-- Create whatsapp_messages table to store WhatsApp webhook event details
CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    direction TEXT NOT NULL CHECK (direction IN ('in', 'out')),
    phone TEXT NOT NULL,
    message_type TEXT NOT NULL,
    payload JSONB NOT NULL,
    status TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS (Row Level Security)
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

-- Create policies (allowing service_role full access)
CREATE POLICY "Allow all access to service_role" ON public.whatsapp_messages
    FOR ALL
    TO service_role
    USING (true)
    WITH CHECK (true);
