
-- Tranzecfy Accounts table
CREATE TABLE public.tranzecfy_accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  name TEXT NOT NULL,
  gstin TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tranzecfy_accounts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tranzecfy accounts"
  ON public.tranzecfy_accounts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tranzecfy accounts"
  ON public.tranzecfy_accounts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tranzecfy accounts"
  ON public.tranzecfy_accounts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tranzecfy accounts"
  ON public.tranzecfy_accounts FOR DELETE
  USING (auth.uid() = user_id);

-- Tranzecfy Transactions table
CREATE TABLE public.tranzecfy_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('made', 'received')),
  amount NUMERIC NOT NULL DEFAULT 0,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  to_account TEXT,
  from_account TEXT,
  description TEXT,
  running_balance NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.tranzecfy_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own tranzecfy transactions"
  ON public.tranzecfy_transactions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own tranzecfy transactions"
  ON public.tranzecfy_transactions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own tranzecfy transactions"
  ON public.tranzecfy_transactions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own tranzecfy transactions"
  ON public.tranzecfy_transactions FOR DELETE
  USING (auth.uid() = user_id);
