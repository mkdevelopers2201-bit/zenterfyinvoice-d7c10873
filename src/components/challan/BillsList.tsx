import { useState } from 'react';
import { useChallanData } from '@/hooks/useChallanData';
import { Bill } from '@/types/challan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Receipt, Trash2, Eye, CheckCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from 'sonner';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

interface BillsListProps {
  onRefresh: () => void;
}

export function BillsList({ onRefresh }: BillsListProps) {
  const { bills, updateBill, deleteBill } = useChallanData();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [billToDelete, setBillToDelete] = useState<string | null>(null);

  const filteredBills = bills.filter(b => 
    b.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    b.billNumber.toLowerCase().includes(searchTerm.toLowerCase())
  ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const handleStatusChange = async (billId: string, status: 'paid' | 'unpaid') => {
    try {
      await updateBill(billId, { status });
      toast.success(`Bill marked as ${status}`);
      onRefresh();
    } catch (error) {
      toast.error('Failed to update bill status');
    }
  };

  const handleDelete = async () => {
    if (billToDelete) {
      try {
        await deleteBill(billToDelete);
        toast.success('Bill deleted successfully');
        onRefresh();
      } catch (error) {
        toast.error('Failed to delete bill');
      }
      setDeleteDialogOpen(false);
      setBillToDelete(null);
    }
  };

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2 text-[#1e3a5f]">
              <Receipt size={20} />
              All Bills ({filteredBills.length})
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search bills..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredBills.length === 0 ? (
            <div className="text-center py-12">
              <Receipt className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No bills found matching your search' : 'No bills yet. Convert challans to create bills!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-[#1e3a5f]/5">
                    <TableHead className="text-[#1e3a5f]">Bill No.</TableHead>
                    <TableHead className="text-[#1e3a5f]">Date</TableHead>
                    <TableHead className="text-[#1e3a5f]">Customer</TableHead>
                    <TableHead className="text-right text-[#1e3a5f]">Subtotal</TableHead>
                    <TableHead className="text-right text-[#1e3a5f]">GST</TableHead>
                    <TableHead className="text-right text-[#1e3a5f]">Net Amount</TableHead>
                    <TableHead className="text-center text-[#1e3a5f]">Status</TableHead>
                    <TableHead className="text-right text-[#1e3a5f]">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredBills.map((bill) => (
                    <TableRow key={bill.id}>
                      <TableCell className="font-medium">{bill.billNumber}</TableCell>
                      <TableCell>{format(new Date(bill.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{bill.customerName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(bill.subtotal)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(bill.gstAmount)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatCurrency(bill.netAmount)}</TableCell>
                      <TableCell className="text-center">
                        <Select
                          value={bill.status}
                          onValueChange={(value: 'paid' | 'unpaid') => handleStatusChange(bill.id, value)}
                        >
                          <SelectTrigger className={`w-28 h-8 ${
                            bill.status === 'paid' 
                              ? 'bg-green-100 text-green-800 border-green-200' 
                              : 'bg-yellow-100 text-yellow-800 border-yellow-200'
                          }`}>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent className="bg-background">
                            <SelectItem value="paid">
                              <div className="flex items-center gap-2">
                                <CheckCircle size={14} className="text-green-600" />
                                Paid
                              </div>
                            </SelectItem>
                            <SelectItem value="unpaid">
                              <div className="flex items-center gap-2">
                                <Clock size={14} className="text-yellow-600" />
                                Unpaid
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button 
                            variant="ghost" 
                            size="icon"
                            className="hover:bg-muted text-destructive"
                            onClick={() => {
                              setBillToDelete(bill.id);
                              setDeleteDialogOpen(true);
                            }}
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill? This will also unmark the associated challans as billed.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
