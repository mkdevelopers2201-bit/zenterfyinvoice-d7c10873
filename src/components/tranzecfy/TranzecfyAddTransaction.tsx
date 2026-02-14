import { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface Props {
  onDone: () => void;
}

export function TranzecfyAddTransaction({ onDone }: Props) {
  const { user } = useAuth();
  const [type, setType] = useState<'made' | 'received'>('received');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [from, setFrom] = useState('');
  const [description, setDescription] = useState('');

  const handleSave = async () => {
    if (!user || !amount || parseFloat(amount) <= 0) {
      toast.error('Please enter a valid amount');
      return;
    }

    // Get current balance
    const { data: existing } = await supabase
      .from('tranzecfy_transactions')
      .select('running_balance')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .limit(1);

    const lastBalance = existing && existing.length > 0 ? Number(existing[0].running_balance) : 0;
    const amt = parseFloat(amount);
    const newBalance = type === 'received' ? lastBalance + amt : lastBalance - amt;

    const { error } = await supabase.from('tranzecfy_transactions').insert({
      user_id: user.id,
      type,
      amount: amt,
      date,
      to_account: type === 'made' ? from : null,
      from_account: type === 'received' ? from : null,
      description: description.trim() || null,
      running_balance: newBalance,
    });

    if (error) { toast.error('Failed to save transaction'); return; }
    toast.success('Transaction saved');
    onDone();
  };

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Add New Transaction</h3>

      <div className="flex gap-4">
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" checked={type === 'made'} onChange={() => setType('made')} className="accent-primary" />
          <span className="text-sm font-medium text-foreground">Payment Made</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input type="radio" checked={type === 'received'} onChange={() => setType('received')} className="accent-primary" />
          <span className="text-sm font-medium text-foreground">Payment Received</span>
        </label>
      </div>

      <div className="space-y-4">
        <div>
          <Label>Amount</Label>
          <Input type="number" placeholder="0.00" value={amount} onChange={e => setAmount(e.target.value)} />
        </div>
        <div>
          <Label>Date</Label>
          <Input type="date" value={date} onChange={e => setDate(e.target.value)} />
        </div>
        <div>
          <Label>From</Label>
          <Input placeholder="Enter Sender" value={from} onChange={e => setFrom(e.target.value)} />
        </div>
        <div>
          <Label>Description (Optional)</Label>
          <Textarea placeholder="Enter your Notes" value={description} onChange={e => setDescription(e.target.value)} />
        </div>
        <div className="flex gap-2">
          <Button onClick={handleSave} className="flex-1">Save</Button>
          <Button variant="outline" onClick={onDone} className="flex-1">Cancel</Button>
        </div>
      </div>
    </div>
  );
}
