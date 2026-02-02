-- Create delivery_challans table
CREATE TABLE public.delivery_challans (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  challan_number TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_address TEXT,
  customer_phone TEXT,
  items JSONB NOT NULL DEFAULT '[]',
  current_amount NUMERIC NOT NULL DEFAULT 0,
  previous_balance NUMERIC NOT NULL DEFAULT 0,
  grand_total NUMERIC NOT NULL DEFAULT 0,
  is_billed BOOLEAN NOT NULL DEFAULT FALSE,
  bill_id UUID,
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create bills table
CREATE TABLE public.bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  bill_number TEXT NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  customer_id UUID REFERENCES public.customers(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_gstin TEXT,
  customer_address TEXT,
  challan_ids UUID[] NOT NULL DEFAULT '{}',
  items JSONB NOT NULL DEFAULT '[]',
  subtotal NUMERIC NOT NULL DEFAULT 0,
  cgst_total NUMERIC NOT NULL DEFAULT 0,
  sgst_total NUMERIC NOT NULL DEFAULT 0,
  gst_amount NUMERIC NOT NULL DEFAULT 0,
  round_off NUMERIC NOT NULL DEFAULT 0,
  net_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'unpaid',
  user_id UUID NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add foreign key for bill_id in delivery_challans
ALTER TABLE public.delivery_challans 
ADD CONSTRAINT delivery_challans_bill_id_fkey 
FOREIGN KEY (bill_id) REFERENCES public.bills(id) ON DELETE SET NULL;

-- Add phone column to customers table
ALTER TABLE public.customers ADD COLUMN IF NOT EXISTS phone TEXT;

-- Enable Row Level Security
ALTER TABLE public.delivery_challans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for delivery_challans
CREATE POLICY "Users can view their own challans" 
ON public.delivery_challans 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challans" 
ON public.delivery_challans 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challans" 
ON public.delivery_challans 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challans" 
ON public.delivery_challans 
FOR DELETE 
USING (auth.uid() = user_id);

-- RLS Policies for bills
CREATE POLICY "Users can view their own bills" 
ON public.bills 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bills" 
ON public.bills 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills" 
ON public.bills 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills" 
ON public.bills 
FOR DELETE 
USING (auth.uid() = user_id);

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_challan_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_delivery_challans_updated_at
BEFORE UPDATE ON public.delivery_challans
FOR EACH ROW
EXECUTE FUNCTION public.update_challan_timestamp();

CREATE TRIGGER update_bills_updated_at
BEFORE UPDATE ON public.bills
FOR EACH ROW
EXECUTE FUNCTION public.update_challan_timestamp();