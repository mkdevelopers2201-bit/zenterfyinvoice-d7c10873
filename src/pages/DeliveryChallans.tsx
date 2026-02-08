import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { useChallanData, getFinancialYear } from '@/hooks/useChallanData';
import { useNavigate } from 'react-router-dom';
import { DeliveryChallan, ChallanItem } from '@/types/challan';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { 
  Search, Plus, Edit, Trash2, FileText, Loader2, UserPlus, Eye, FileOutput
} from 'lucide-react';
import { format, parse } from 'date-fns';
import { toast } from 'sonner';
import { v4 as uuidv4 } from 'uuid';
import { ChallanPreview } from '@/components/challan/ChallanPreview';
import { ConvertToInvoice } from '@/components/challan/ConvertToInvoice';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export default function DeliveryChallans() {
  const { customers, addCustomer, items } = useData();
  const navigate = useNavigate();
  const { 
    challans, bills, isLoading, 
    getNextChallanNumber, getPreviousBalance, getUnbilledChallans,
    addChallan, updateChallan, deleteChallan, refreshData 
  } = useChallanData();

  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [previewDialogOpen, setPreviewDialogOpen] = useState(false);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [newCustomerDialogOpen, setNewCustomerDialogOpen] = useState(false);
  const [challanToDelete, setChallanToDelete] = useState<string | null>(null);
  const [editingChallan, setEditingChallan] = useState<DeliveryChallan | null>(null);
  const [previewChallan, setPreviewChallan] = useState<DeliveryChallan | null>(null);
  const [convertCustomerId, setConvertCustomerId] = useState<string | null>(null);

  const [newCustomerForm, setNewCustomerForm] = useState({
    name: '', gstin: '', address: '', phone: '',
  });

  const [formData, setFormData] = useState({
    challanNumber: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    customerId: '',
    customerName: '',
    customerAddress: '',
    customerPhone: '',
    items: [] as ChallanItem[],
    previousBalance: 0,
  });

  const currentAmount = useMemo(() => {
    return formData.items.reduce((sum, item) => sum + item.total, 0);
  }, [formData.items]);

  const grandTotal = useMemo(() => {
    return formData.previousBalance + currentAmount;
  }, [formData.previousBalance, currentAmount]);

  const filteredChallans = useMemo(() => {
    return challans.filter(c => 
      c.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.challanNumber.toLowerCase().includes(searchTerm.toLowerCase())
    ).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [challans, searchTerm]);

  const resetForm = () => {
    const selectedDate = new Date();
    setFormData({
      challanNumber: getNextChallanNumber(selectedDate),
      date: format(selectedDate, 'yyyy-MM-dd'),
      customerId: '', customerName: '', customerAddress: '', customerPhone: '',
      items: [], previousBalance: 0,
    });
    setEditingChallan(null);
  };

  const handleOpenDialog = (challan?: DeliveryChallan) => {
    if (challan) {
      setEditingChallan(challan);
      setFormData({
        challanNumber: challan.challanNumber,
        date: challan.date,
        customerId: challan.customerId || '',
        customerName: challan.customerName,
        customerAddress: challan.customerAddress || '',
        customerPhone: challan.customerPhone || '',
        items: challan.items,
        previousBalance: challan.previousBalance,
      });
    } else {
      resetForm();
    }
    setDialogOpen(true);
  };

  const handleDateChange = (newDate: string) => {
    const date = parse(newDate, 'yyyy-MM-dd', new Date());
    const newChallanNumber = getNextChallanNumber(date);
    setFormData(prev => ({
      ...prev,
      date: newDate,
      challanNumber: editingChallan ? prev.challanNumber : newChallanNumber,
    }));
  };

  const handleCustomerChange = (customerId: string) => {
    if (customerId === 'new') {
      setNewCustomerDialogOpen(true);
      return;
    }
    const customer = customers.find(c => c.id === customerId);
    if (customer) {
      const prevBalance = getPreviousBalance(customer.id, customer.name);
      setFormData(prev => ({
        ...prev,
        customerId: customer.id,
        customerName: customer.name,
        customerAddress: customer.address,
        customerPhone: (customer as any).phone || '',
        previousBalance: prevBalance,
      }));
    }
  };

  const handleAddNewCustomer = async () => {
    if (!newCustomerForm.name.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    try {
      const newCustomer = await addCustomer({
        name: newCustomerForm.name,
        gstin: newCustomerForm.gstin,
        address: newCustomerForm.address,
      });
      setFormData(prev => ({
        ...prev,
        customerId: newCustomer.id,
        customerName: newCustomer.name,
        customerAddress: newCustomer.address,
        customerPhone: newCustomerForm.phone,
        previousBalance: 0,
      }));
      setNewCustomerForm({ name: '', gstin: '', address: '', phone: '' });
      setNewCustomerDialogOpen(false);
      toast.success('Customer added successfully');
    } catch (error) {
      toast.error('Failed to add customer');
    }
  };

  const handleAddItem = () => {
    setFormData(prev => ({
      ...prev,
      items: [...prev.items, { id: uuidv4(), name: '', qty: 1, rate: 0, total: 0 }],
    }));
  };

  const handleItemChange = (index: number, field: keyof ChallanItem, value: any) => {
    setFormData(prev => {
      const newItems = [...prev.items];
      newItems[index] = { ...newItems[index], [field]: value };
      if (field === 'qty' || field === 'rate') {
        newItems[index].total = newItems[index].qty * newItems[index].rate;
      }
      return { ...prev, items: newItems };
    });
  };

  const handleRemoveItem = (index: number) => {
    setFormData(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const handleSubmit = async () => {
    if (!formData.customerName.trim()) {
      toast.error('Please select or enter a customer');
      return;
    }
    if (formData.items.length === 0) {
      toast.error('Please add at least one item');
      return;
    }
    try {
      if (editingChallan) {
        await updateChallan(editingChallan.id, {
          challanNumber: formData.challanNumber,
          date: formData.date,
          customerId: formData.customerId || undefined,
          customerName: formData.customerName,
          customerAddress: formData.customerAddress,
          customerPhone: formData.customerPhone,
          items: formData.items,
          currentAmount, previousBalance: formData.previousBalance, grandTotal,
        });
        toast.success('Challan updated successfully');
      } else {
        await addChallan({
          challanNumber: formData.challanNumber,
          date: formData.date,
          customerId: formData.customerId || undefined,
          customerName: formData.customerName,
          customerAddress: formData.customerAddress,
          customerPhone: formData.customerPhone,
          items: formData.items,
          currentAmount, previousBalance: formData.previousBalance, grandTotal,
          isBilled: false,
        });
        toast.success('Challan created successfully');
      }
      setDialogOpen(false);
      resetForm();
    } catch (error) {
      toast.error('Failed to save challan');
    }
  };

  const handleDelete = async () => {
    if (challanToDelete) {
      try {
        await deleteChallan(challanToDelete);
        toast.success('Challan deleted successfully');
      } catch (error) {
        toast.error('Failed to delete challan');
      }
      setDeleteDialogOpen(false);
      setChallanToDelete(null);
    }
  };

  const handleConvertToInvoice = (customerId: string) => {
    setConvertCustomerId(customerId);
    setConvertDialogOpen(true);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-medium text-foreground">Delivery Challans</h1>
          <p className="text-muted-foreground">Manage delivery challans</p>
        </div>
        <Button onClick={() => handleOpenDialog()} className="gap-2">
          <Plus size={20} />
          New Challan
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <CardTitle className="flex items-center gap-2">
              <FileText size={20} />
              All Challans ({filteredChallans.length})
            </CardTitle>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search challans..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-9"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredChallans.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-12 w-12 mx-auto text-muted-foreground/50 mb-3" />
              <p className="text-muted-foreground">
                {searchTerm ? 'No challans found matching your search' : 'No challans yet. Create your first challan!'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Challan No.</TableHead>
                    <TableHead>Date</TableHead>
                    <TableHead>Customer</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                    <TableHead className="text-right">Previous</TableHead>
                    <TableHead className="text-right">Grand Total</TableHead>
                    <TableHead className="text-center">Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredChallans.map((challan) => (
                    <TableRow key={challan.id}>
                      <TableCell className="font-medium">{challan.challanNumber}</TableCell>
                      <TableCell>{format(new Date(challan.date), 'dd MMM yyyy')}</TableCell>
                      <TableCell>{challan.customerName}</TableCell>
                      <TableCell className="text-right">{formatCurrency(challan.currentAmount)}</TableCell>
                      <TableCell className="text-right">{formatCurrency(challan.previousBalance)}</TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(challan.grandTotal)}</TableCell>
                      <TableCell className="text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          challan.isBilled 
                            ? 'bg-accent text-accent-foreground' 
                            : 'bg-muted text-muted-foreground'
                        }`}>
                          {challan.isBilled ? 'Billed' : 'Pending'}
                        </span>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center justify-end gap-1">
                          <Button variant="ghost" size="icon" onClick={() => { setPreviewChallan(challan); setPreviewDialogOpen(true); }} title="Preview">
                            <Eye size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(challan)} title="Edit" disabled={challan.isBilled}>
                            <Edit size={16} />
                          </Button>
                          <Button variant="ghost" size="icon" className="hover:text-destructive" onClick={() => { setChallanToDelete(challan.id); setDeleteDialogOpen(true); }} title="Delete" disabled={challan.isBilled}>
                            <Trash2 size={16} />
                          </Button>
                          {!challan.isBilled && (
                            <Button variant="ghost" size="icon" onClick={() => handleConvertToInvoice(challan.customerId || '')} title="Convert to Invoice" className="text-primary">
                              <FileOutput size={16} />
                            </Button>
                          )}
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

      {/* Create/Edit Challan Dialog */}
      <Dialog open={dialogOpen} onOpenChange={(open) => { setDialogOpen(open); if (!open) resetForm(); }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingChallan ? 'Edit Delivery Challan' : 'New Delivery Challan'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label>Challan Number</Label>
              <Input value={formData.challanNumber} onChange={(e) => setFormData(prev => ({ ...prev, challanNumber: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Date</Label>
              <Input type="date" value={formData.date} onChange={(e) => handleDateChange(e.target.value)} className="mt-1" />
            </div>
            <div className="md:col-span-2">
              <Label>Customer</Label>
              <Select value={formData.customerId} onValueChange={handleCustomerChange}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Select customer" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="new" className="text-primary font-medium">
                    <div className="flex items-center gap-2">
                      <UserPlus size={16} />
                      Add New Customer
                    </div>
                  </SelectItem>
                  {customers.map(customer => (
                    <SelectItem key={customer.id} value={customer.id}>{customer.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Customer Address</Label>
              <Input value={formData.customerAddress} onChange={(e) => setFormData(prev => ({ ...prev, customerAddress: e.target.value }))} className="mt-1" />
            </div>
            <div>
              <Label>Phone Number</Label>
              <Input value={formData.customerPhone} onChange={(e) => setFormData(prev => ({ ...prev, customerPhone: e.target.value }))} className="mt-1" />
            </div>
          </div>

          {/* Items Section */}
          <div className="mt-6">
            <div className="flex items-center justify-between mb-3">
              <Label className="text-lg font-medium">Items</Label>
              <Button variant="outline" size="sm" onClick={handleAddItem}>
                <Plus size={16} className="mr-1" /> Add Item
              </Button>
            </div>
            {formData.items.length === 0 ? (
              <div className="text-center py-8 border rounded-md bg-muted/30">
                <p className="text-muted-foreground">No items added. Click "Add Item" to start.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/30">
                    <TableHead>Particulars</TableHead>
                    <TableHead className="w-24">QTY</TableHead>
                    <TableHead className="w-28">Rate</TableHead>
                    <TableHead className="w-28 text-right">Total</TableHead>
                    <TableHead className="w-12"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {formData.items.map((item, index) => (
                    <TableRow key={item.id}>
                      <TableCell>
                        <Input value={item.name} onChange={(e) => handleItemChange(index, 'name', e.target.value)} placeholder="Item name" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={item.qty} onChange={(e) => handleItemChange(index, 'qty', parseFloat(e.target.value) || 0)} min="0" step="0.01" />
                      </TableCell>
                      <TableCell>
                        <Input type="number" value={item.rate} onChange={(e) => handleItemChange(index, 'rate', parseFloat(e.target.value) || 0)} min="0" step="0.01" />
                      </TableCell>
                      <TableCell className="text-right font-medium">{formatCurrency(item.total)}</TableCell>
                      <TableCell>
                        <Button variant="ghost" size="icon" onClick={() => handleRemoveItem(index)} className="hover:text-destructive">
                          <Trash2 size={16} />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>

          {/* Totals */}
          <div className="mt-6 flex justify-end">
            <div className="w-full max-w-xs space-y-2">
              <div className="flex justify-between"><span>Amount:</span><span className="font-medium">{formatCurrency(currentAmount)}</span></div>
              <div className="flex justify-between"><span>Previous Balance:</span><span className="font-medium">{formatCurrency(formData.previousBalance)}</span></div>
              <div className="flex justify-between"><span>This Challan:</span><span className="font-medium">{formatCurrency(currentAmount)}</span></div>
              <div className="flex justify-between border-t pt-2">
                <span className="font-medium text-primary">Grand Total:</span>
                <span className="font-medium text-primary">{formatCurrency(grandTotal)}</span>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSubmit}>{editingChallan ? 'Update' : 'Create'} Challan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* New Customer Dialog */}
      <Dialog open={newCustomerDialogOpen} onOpenChange={setNewCustomerDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Add New Customer</DialogTitle></DialogHeader>
          <div className="space-y-4">
            <div><Label>Customer Name *</Label><Input value={newCustomerForm.name} onChange={(e) => setNewCustomerForm(prev => ({ ...prev, name: e.target.value }))} placeholder="Enter customer name" className="mt-1" /></div>
            <div><Label>GSTIN</Label><Input value={newCustomerForm.gstin} onChange={(e) => setNewCustomerForm(prev => ({ ...prev, gstin: e.target.value }))} placeholder="e.g., 22AAAAA0000A1Z5" className="mt-1" /></div>
            <div><Label>Address</Label><Input value={newCustomerForm.address} onChange={(e) => setNewCustomerForm(prev => ({ ...prev, address: e.target.value }))} placeholder="Enter address" className="mt-1" /></div>
            <div><Label>Phone</Label><Input value={newCustomerForm.phone} onChange={(e) => setNewCustomerForm(prev => ({ ...prev, phone: e.target.value }))} placeholder="Enter phone number" className="mt-1" /></div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setNewCustomerDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleAddNewCustomer}>Add Customer</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Preview Dialog */}
      <Dialog open={previewDialogOpen} onOpenChange={setPreviewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>Challan Preview</DialogTitle></DialogHeader>
          {previewChallan && <ChallanPreview challan={previewChallan} />}
        </DialogContent>
      </Dialog>

      {/* Convert to Invoice Dialog */}
      {convertDialogOpen && convertCustomerId && (
        <ConvertToInvoice
          customerId={convertCustomerId}
          open={convertDialogOpen}
          onClose={() => { setConvertDialogOpen(false); setConvertCustomerId(null); }}
          onSuccess={() => { refreshData(); setConvertDialogOpen(false); setConvertCustomerId(null); }}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Challan</AlertDialogTitle>
            <AlertDialogDescription>Are you sure? This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive hover:bg-destructive/90">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
