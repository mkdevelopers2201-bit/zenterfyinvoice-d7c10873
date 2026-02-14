import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  to_account: string | null;
  from_account: string | null;
  running_balance: number;
}

export function TranzecfyHome() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [made, setMade] = useState(0);
  const [received, setReceived] = useState(0);
  const [dateFilter, setDateFilter] = useState('all');

  useEffect(() => {
    if (!user) return;
    const fetchTransactions = async () => {
      const { data } = await supabase
        .from('tranzecfy_transactions')
        .select('*')
        .eq('user_id', user.id)
        .order('date', { ascending: false });
      
      if (data) {
        setTransactions(data as Transaction[]);
        const m = data.filter(t => t.type === 'made').reduce((s, t) => s + Number(t.amount), 0);
        const r = data.filter(t => t.type === 'received').reduce((s, t) => s + Number(t.amount), 0);
        setMade(m);
        setReceived(r);
      }
    };
    fetchTransactions();
  }, [user]);

  const filtered = dateFilter === 'all' ? transactions : transactions.filter(t => {
    const d = new Date(t.date);
    const now = new Date();
    if (dateFilter === 'this_month') return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    if (dateFilter === 'last_month') {
      const lm = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return d.getMonth() === lm.getMonth() && d.getFullYear() === lm.getFullYear();
    }
    return true;
  });

  const balance = received - made;

  return (
    <div className="space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-3">
        <div className="rounded-xl border-2 border-destructive/30 p-4 text-center">
          <p className="text-sm text-muted-foreground font-medium">Made</p>
          <p className="text-2xl font-bold text-destructive">{made.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border-2 border-green-400/50 p-4 text-center">
          <p className="text-sm text-muted-foreground font-medium">Received</p>
          <p className="text-2xl font-bold text-green-600">{received.toFixed(2)}</p>
        </div>
        <div className="rounded-xl border-2 border-primary/30 p-4 text-center">
          <p className="text-sm text-muted-foreground font-medium">Balance</p>
          <p className="text-2xl font-bold text-primary">{balance.toFixed(2)}</p>
        </div>
      </div>

      {/* Transaction History */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-foreground">Transactions History</h3>
        <Select value={dateFilter} onValueChange={setDateFilter}>
          <SelectTrigger className="w-[140px] border-primary text-primary">
            <SelectValue placeholder="Select Date" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All</SelectItem>
            <SelectItem value="this_month">This Month</SelectItem>
            <SelectItem value="last_month">Last Month</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="rounded-lg overflow-hidden border">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-muted/50">
              <th className="p-2 text-left font-medium text-muted-foreground">Type</th>
              <th className="p-2 text-left font-medium text-muted-foreground">Date</th>
              <th className="p-2 text-left font-medium text-muted-foreground">To</th>
              <th className="p-2 text-left font-medium text-muted-foreground">From</th>
              <th className="p-2 text-right font-medium text-muted-foreground">Amount</th>
              <th className="p-2 text-right font-medium text-muted-foreground">Balance</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No transactions yet</td></tr>
            ) : filtered.map(t => (
              <tr key={t.id} className="border-t">
                <td className="p-2">
                  <span className={t.type === 'made' ? 'text-destructive' : 'text-green-600'}>
                    {t.type === 'made' ? '↑' : '↓'}
                  </span>
                </td>
                <td className="p-2">{format(new Date(t.date), 'dd/MM/yy')}</td>
                <td className="p-2">{t.to_account || '-'}</td>
                <td className="p-2">{t.from_account || '-'}</td>
                <td className="p-2 text-right">{Number(t.amount).toFixed(2)}</td>
                <td className="p-2 text-right">{Number(t.running_balance).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
