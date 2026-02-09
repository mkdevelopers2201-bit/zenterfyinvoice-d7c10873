
-- Drop restrictive policies on bills
DROP POLICY IF EXISTS "Users can create their own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can delete their own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can update their own bills" ON public.bills;
DROP POLICY IF EXISTS "Users can view their own bills" ON public.bills;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Users can view their own bills"
ON public.bills FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bills"
ON public.bills FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills"
ON public.bills FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own bills"
ON public.bills FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Drop restrictive policies on delivery_challans
DROP POLICY IF EXISTS "Users can create their own challans" ON public.delivery_challans;
DROP POLICY IF EXISTS "Users can delete their own challans" ON public.delivery_challans;
DROP POLICY IF EXISTS "Users can update their own challans" ON public.delivery_challans;
DROP POLICY IF EXISTS "Users can view their own challans" ON public.delivery_challans;

-- Recreate as PERMISSIVE policies
CREATE POLICY "Users can view their own challans"
ON public.delivery_challans FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own challans"
ON public.delivery_challans FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own challans"
ON public.delivery_challans FOR UPDATE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own challans"
ON public.delivery_challans FOR DELETE
TO authenticated
USING (auth.uid() = user_id);
