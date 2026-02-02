import { useState, useMemo } from 'react';
import { useChallanData, getFinancialYear } from '@/hooks/useChallanData';
import { useData } from '@/context/DataContext';
import { BillItem } from '@/types/challan';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface ConvertToInvoiceProps {
  customerId: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ConvertToInvoice({ customerId, open, onClose, onSuccess }: ConvertToInvoiceProps) {
  const { getUnbilledChallans, getNextBillNumber, addBill } = useChallanData();
  const { customers, items: dataItems, getItemByName } = useData();
  
  const customer = customers.find(c => c.id === customerId);
  const unbilledChallans = getUnbilledChallans(customerId, customer?.name);
  
  const [selectedChallanIds, setSelectedChallanIds] = useState<string[]>(
    unbilledChallans.map(c => c.id)
  );
  const [gstRate, setGstRate] = useState(18); // Default 18% GST (9% CGST + 9% SGST)
  const [billDate, setBillDate] = useState(format(new Date(), 'yyyy-MM-dd'));

  // Combine items from selected challans
  const combinedItems = useMemo(() => {
    const itemMap = new Map<string, { name: string; qty: number; rate: number; hsnCode?: string }>();
    
    unbilledChallans
      .filter(c => selectedChallanIds.includes(c.id))
      .forEach(challan => {
        challan.items.forEach(item => {
          const key = `${item.name}-${item.rate}`;
          const existing = itemMap.get(key);
          
          // Try to get HSN code from existing items database
          const existingItem = getItemByName(item.name);
          const hsnCode = existingItem?.hsnCode || '';
          
          if (existing) {
            existing.qty += item.qty;
          } else {
            itemMap.set(key, {
              name: item.name,
              qty: item.qty,
              rate: item.rate,
              hsnCode,
            });
          }
        });
      });
    
    return Array.from(itemMap.values());
  }, [unbilledChallans, selectedChallanIds, getItemByName]);

  // Calculate totals
  const calculations = useMemo(() => {
    const subtotal = combinedItems.reduce((sum, item) => sum + (item.qty * item.rate), 0);
    const cgstPercent = gstRate / 2;
    const sgstPercent = gstRate / 2;
    const cgstTotal = subtotal * (cgstPercent / 100);
    const sgstTotal = subtotal * (sgstPercent / 100);
    const gstAmount = cgstTotal + sgstTotal;
    const netBeforeRound = subtotal + gstAmount;
    const roundOff = Math.round(netBeforeRound) - netBeforeRound;
    const netAmount = Math.round(netBeforeRound);

    return {
      subtotal,
      cgstPercent,
      sgstPercent,
      cgstTotal,
      sgstTotal,
      gstAmount,
      roundOff,
      netAmount,
    };
  }, [combinedItems, gstRate]);

  const handleChallanToggle = (challanId: string) => {
    setSelectedChallanIds(prev => 
      prev.includes(challanId)
        ? prev.filter(id => id !== challanId)
        : [...prev, challanId]
    );
  };

  const handleCreateBill = async () => {
    if (selectedChallanIds.length === 0) {
      toast.error('Please select at least one challan');
      return;
    }

    try {
      const billItems: BillItem[] = combinedItems.map(item => ({
        id: uuidv4(),
        name: item.name,
        hsnCode: item.hsnCode,
        qty: item.qty,
        rate: item.rate,
        amount: item.qty * item.rate,
        cgstPercent: calculations.cgstPercent,
        sgstPercent: calculations.sgstPercent,
        cgstAmount: (item.qty * item.rate) * (calculations.cgstPercent / 100),
        sgstAmount: (item.qty * item.rate) * (calculations.sgstPercent / 100),
        total: (item.qty * item.rate) * (1 + gstRate / 100),
      }));

      await addBill({
        billNumber: getNextBillNumber(new Date(billDate)),
        date: billDate,
        customerId: customer?.id,
        customerName: customer?.name || '',
        customerGstin: customer?.gstin,
        customerAddress: customer?.address,
        challanIds: selectedChallanIds,
        items: billItems,
        subtotal: calculations.subtotal,
        cgstTotal: calculations.cgstTotal,
        sgstTotal: calculations.sgstTotal,
        gstAmount: calculations.gstAmount,
        roundOff: calculations.roundOff,
        netAmount: calculations.netAmount,
        status: 'unpaid',
      });

      toast.success('Bill created successfully');
      onSuccess();
    } catch (error) {
      toast.error('Failed to create bill');
    }
  };

  if (!customer) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-[#1e3a5f]">Convert to Invoice - {customer.name}</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Bill Details */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Bill Number</Label>
              <Input 
                value={getNextBillNumber(new Date(billDate))} 
                disabled 
                className="mt-1"
              />
            </div>
            <div>
              <Label>Bill Date</Label>
              <Input 
                type="date"
                value={billDate}
                onChange={(e) => setBillDate(e.target.value)}
                className="mt-1"
              />
            </div>
          </div>

          {/* Select Challans */}
          <div>
            <Label className="text-lg font-semibold text-[#1e3a5f]">Select Challans to Include</Label>
            <div className="mt-2 space-y-2">
              {unbilledChallans.length === 0 ? (
                <p className="text-muted-foreground py-4 text-center">
                  No unbilled challans found for this customer.
                </p>
              ) : (
                unbilledChallans.map(challan => (
                  <div 
                    key={challan.id} 
                    className="flex items-center gap-3 p-3 border rounded-lg hover:bg-muted/50"
                  >
                    <Checkbox
                      checked={selectedChallanIds.includes(challan.id)}
                      onCheckedChange={() => handleChallanToggle(challan.id)}
                    />
                    <div className="flex-1">
                      <span className="font-medium">{challan.challanNumber}</span>
                      <span className="text-muted-foreground ml-2">
                        ({format(new Date(challan.date), 'dd MMM yyyy')})
                      </span>
                    </div>
                    <span className="font-medium">{formatCurrency(challan.currentAmount)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* GST Rate */}
          <div className="w-48">
            <Label>GST Rate (%)</Label>
            <Input
              type="number"
              value={gstRate}
              onChange={(e) => setGstRate(parseFloat(e.target.value) || 0)}
              min="0"
              max="28"
              step="0.5"
              className="mt-1"
            />
            <p className="text-xs text-muted-foreground mt-1">
              CGST: {gstRate / 2}% | SGST: {gstRate / 2}%
            </p>
          </div>

          {/* Combined Items Preview */}
          {combinedItems.length > 0 && (
            <div>
              <Label className="text-lg font-semibold text-[#1e3a5f]">Items Summary</Label>
              <Table className="mt-2">
                <TableHeader>
                  <TableRow className="bg-[#1e3a5f]/5">
                    <TableHead className="text-[#1e3a5f]">Particulars</TableHead>
                    <TableHead className="text-[#1e3a5f]">HSN</TableHead>
                    <TableHead className="text-center text-[#1e3a5f]">QTY</TableHead>
                    <TableHead className="text-right text-[#1e3a5f]">Rate</TableHead>
                    <TableHead className="text-right text-[#1e3a5f]">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {combinedItems.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.name}</TableCell>
                      <TableCell>{item.hsnCode || '-'}</TableCell>
                      <TableCell className="text-center">{item.qty}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.rate)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(item.qty * item.rate)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-80 space-y-2">
              <div className="flex justify-between py-1">
                <span>Subtotal:</span>
                <span>{formatCurrency(calculations.subtotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>CGST ({calculations.cgstPercent}%):</span>
                <span>{formatCurrency(calculations.cgstTotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>SGST ({calculations.sgstPercent}%):</span>
                <span>{formatCurrency(calculations.sgstTotal)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span>Round Off:</span>
                <span>{calculations.roundOff >= 0 ? '+' : ''}{formatCurrency(calculations.roundOff)}</span>
              </div>
              <div className="flex justify-between py-2 border-t-2 border-[#1e3a5f] font-bold text-[#1e3a5f]">
                <span>Net Amount:</span>
                <span>{formatCurrency(calculations.netAmount)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button 
            onClick={handleCreateBill} 
            className="bg-[#1e3a5f] hover:bg-[#2d4a6f]"
            disabled={selectedChallanIds.length === 0}
          >
            Create Bill
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
