import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ChevronRight, MoreVertical } from 'lucide-react';
import { toast } from 'sonner';

interface Account {
  id: string;
  name: string;
  gstin: string | null;
  transaction_count?: number;
  balance?: number;
}

export function TranzecfyAccounts() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [gstin, setGstin] = useState('');

  const fetchAccounts = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('tranzecfy_accounts')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false });
    if (data) setAccounts(data as Account[]);
  };

  useEffect(() => { fetchAccounts(); }, [user]);

  const handleAdd = async () => {
    if (!user || !name.trim()) return;
    const { error } = await supabase.from('tranzecfy_accounts').insert({
      user_id: user.id,
      name: name.trim(),
      gstin: gstin.trim() || null,
    });
    if (error) { toast.error('Failed to add account'); return; }
    toast.success('Account added');
    setName(''); setGstin(''); setShowForm(false);
    fetchAccounts();
  };

  if (showForm) {
    return (
      <div className="space-y-6">
        <h3 className="text-lg font-semibold text-foreground">Add New Account</h3>
        <div className="space-y-4">
          <div>
            <Label>Name</Label>
            <Input placeholder="Party Name here" value={name} onChange={e => setName(e.target.value)} />
          </div>
          <div>
            <Label>GSTIN</Label>
            <Input placeholder="GSTIN Number" value={gstin} onChange={e => setGstin(e.target.value)} />
          </div>
          <div className="flex gap-2">
            <Button onClick={handleAdd} className="flex-1">Save</Button>
            <Button variant="outline" onClick={() => setShowForm(false)} className="flex-1">Cancel</Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Accounts</h3>
        <Button onClick={() => setShowForm(true)}>Add Accounts</Button>
      </div>

      <div className="space-y-3">
        {accounts.length === 0 ? (
          <p className="text-center text-muted-foreground py-8">No accounts yet</p>
        ) : accounts.map(acc => (
          <div key={acc.id} className="border rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-semibold text-foreground">{acc.name}</p>
                <p className="text-sm text-muted-foreground">{acc.gstin || 'No GSTIN'}</p>
              </div>
              <div className="flex items-center gap-1">
                <ChevronRight className="h-4 w-4 text-muted-foreground" />
                <MoreVertical className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
            <div className="flex gap-6 mt-2">
              <div>
                <p className="text-primary font-semibold">0</p>
                <p className="text-xs text-muted-foreground">Transactions</p>
              </div>
              <div>
                <p className="text-green-600 font-semibold">0.00 CR</p>
                <p className="text-xs text-muted-foreground">Balance</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
