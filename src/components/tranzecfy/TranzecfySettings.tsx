import { useState } from 'react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

export function TranzecfySettings() {
  const [emailNotif, setEmailNotif] = useState(true);
  const [paymentReminders, setPaymentReminders] = useState(false);
  const [lowBalance, setLowBalance] = useState(false);
  const [showCurrency, setShowCurrency] = useState(true);

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold text-foreground">Settings</h3>
      
      <div className="border rounded-lg p-4 space-y-4">
        <h4 className="text-base font-semibold text-foreground">Notifications</h4>
        <div className="flex items-center justify-between">
          <Label>Email Notifications</Label>
          <Switch checked={emailNotif} onCheckedChange={setEmailNotif} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Payment Reminders</Label>
          <Switch checked={paymentReminders} onCheckedChange={setPaymentReminders} />
        </div>
        <div className="flex items-center justify-between">
          <Label>Low Balance Alerts</Label>
          <Switch checked={lowBalance} onCheckedChange={setLowBalance} />
        </div>
      </div>

      <div className="border rounded-lg p-4 space-y-4">
        <h4 className="text-base font-semibold text-foreground">Display</h4>
        <div className="flex items-center justify-between">
          <Label>Show Currency Symbol</Label>
          <Switch checked={showCurrency} onCheckedChange={setShowCurrency} />
        </div>
        <div>
          <Label className="text-sm text-muted-foreground">Currency Symbol</Label>
          <div className="mt-1 inline-block rounded-md bg-muted px-3 py-1 text-sm text-foreground">
            INR (₹)
          </div>
        </div>
      </div>
    </div>
  );
}
