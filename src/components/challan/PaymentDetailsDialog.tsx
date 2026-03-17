import { useState } from 'react';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

export interface PaymentDetails {
  paymentMethod: string;
  paymentAmount: number;
  paymentDate: string;
  chequeNumber?: string;
  referenceNumber?: string;
}

interface PaymentDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  billNetAmount: number;
  onConfirm: (details: PaymentDetails) => void;
}

export function PaymentDetailsDialog({ open, onOpenChange, billNetAmount, onConfirm }: PaymentDetailsDialogProps) {
  const [method, setMethod] = useState('');
  const [amount, setAmount] = useState(String(billNetAmount));
  const [date, setDate] = useState<Date>(new Date());
  const [chequeNumber, setChequeNumber] = useState('');
  const [referenceNumber, setReferenceNumber] = useState('');

  const handleConfirm = () => {
    if (!method) return;
    if (!amount || Number(amount) <= 0) return;

    const details: PaymentDetails = {
      paymentMethod: method,
      paymentAmount: Number(amount),
      paymentDate: format(date, 'yyyy-MM-dd'),
    };

    if (method === 'Cheque' && chequeNumber.trim()) {
      details.chequeNumber = chequeNumber.trim();
    }
    if (method === 'NEFT' && referenceNumber.trim()) {
      details.referenceNumber = referenceNumber.trim();
    }

    onConfirm(details);

    // Reset
    setMethod('');
    setAmount(String(billNetAmount));
    setDate(new Date());
    setChequeNumber('');
    setReferenceNumber('');
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Payment Details</DialogTitle>
          <DialogDescription>
            Enter the payment details to mark this bill as paid.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Payment Method */}
          <div className="space-y-2">
            <Label>Payment Method *</Label>
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger>
                <SelectValue placeholder="Select method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="GPay">GPay</SelectItem>
                <SelectItem value="Cheque">Cheque</SelectItem>
                <SelectItem value="NEFT">NEFT</SelectItem>
                <SelectItem value="Cash">Cash</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Cheque Number - shown only when Cheque selected */}
          {method === 'Cheque' && (
            <div className="space-y-2">
              <Label>Cheque Number</Label>
              <Input
                placeholder="Enter cheque number"
                value={chequeNumber}
                onChange={(e) => setChequeNumber(e.target.value)}
              />
            </div>
          )}

          {/* Reference Number - shown only when NEFT selected */}
          {method === 'NEFT' && (
            <div className="space-y-2">
              <Label>Reference Number</Label>
              <Input
                placeholder="Enter NEFT reference number"
                value={referenceNumber}
                onChange={(e) => setReferenceNumber(e.target.value)}
              />
            </div>
          )}

          {/* Payment Amount */}
          <div className="space-y-2">
            <Label>Payment Amount (₹) *</Label>
            <Input
              type="number"
              placeholder="Enter amount"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
            />
          </div>

          {/* Payment Date */}
          <div className="space-y-2">
            <Label>Payment Date *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, 'dd MMM yyyy') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(d) => d && setDate(d)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Cancel</Button>
          <Button onClick={handleConfirm} disabled={!method || !amount || Number(amount) <= 0}>
            Confirm Payment
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
