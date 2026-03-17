ALTER TABLE public.bills 
  ADD COLUMN payment_method text DEFAULT NULL,
  ADD COLUMN payment_amount numeric DEFAULT 0,
  ADD COLUMN payment_date date DEFAULT NULL,
  ADD COLUMN cheque_number text DEFAULT NULL,
  ADD COLUMN reference_number text DEFAULT NULL;