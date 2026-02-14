import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { RefreshCw } from 'lucide-react';

interface Transaction {
  id: string;
  type: string;
  amount: number;
  date: string;
  to_account: string | null;
  from_account: string | null;
  running_balance: number;
}

const MONTHS = ['January','February','March','April','May','June','July','August','September','October','November','December'];

export function TranzecfyReports() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [month, setMonth] = useState('all');
  const [year, setYear] = useState('all');

  const fetchData = async () => {
    if (!user) return;
    const { data } = await supabase
      .from('tranzecfy_transactions')
      .select('*')
      .eq('user_id', user.id)
      .order('date', { ascending: false });
    if (data) setTransactions(data as Transaction[]);
  };

  useEffect(() => { fetchData(); }, [user]);

  const filtered = transactions.filter(t => {
    const d = new Date(t.date);
    if (month !== 'all' && d.getMonth() !== parseInt(month)) return false;
    if (year !== 'all' && d.getFullYear() !== parseInt(year)) return false;
    return true;
  });

  const years = [...new Set(transactions.map(t => new Date(t.date).getFullYear()))].sort((a, b) => b - a);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 flex-wrap">
        <h3 className="text-lg font-semibold text-foreground">View Reports</h3>
        <Select value={month} onValueChange={setMonth}>
          <SelectTrigger className="w-[140px] border-primary text-primary">
            <SelectValue placeholder="Select Months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Months</SelectItem>
            {MONTHS.map((m, i) => <SelectItem key={i} value={String(i)}>{m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger className="w-[130px] border-primary text-primary">
            <SelectValue placeholder="Select Years" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Years</SelectItem>
            {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
        <Button variant="outline" size="icon" onClick={() => { setMonth('all'); setYear('all'); }}>
          <RefreshCw className="h-4 w-4" />
        </Button>
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
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No transactions found</td></tr>
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
