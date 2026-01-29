-- Add roundOff column to invoices table
ALTER TABLE public.invoices ADD COLUMN IF NOT EXISTS "roundOff" numeric DEFAULT 0;