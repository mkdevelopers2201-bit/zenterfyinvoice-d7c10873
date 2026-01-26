import { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { v4 as uuidv4 } from 'uuid';
import { InvoiceItem } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Plus, Trash2, Save, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import { format } from 'date-fns';

const createEmptyItem = (): InvoiceItem => ({
  id: uuidv4(),
  name: '',
  hsnCode: '',
  rate: 0,
  qty: 1,
  cgstPercent: 9,
  sgstPercent: 9,
  amount: 0,
  cgstAmount: 0,
  sgstAmount: 0,
  total: 0
});

export default function CreateInvoice() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const editId = searchParams.get('edit');
  
  const { 
    customers, 
    items, 
    invoices,
    addCustomer, 
    addItem, 
    addInvoice, 
    updateInvoice,
    getCustomerByName, 
    getItemByName,
    getNextInvoiceNumber 
  } = useData();

  const [customerName, setCustomerName] = useState('');
  const [gstin, setGstin] = useState('');
  const [address, setAddress] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState('');
  const [date, setDate] = useState(format(new Date(), 'yyyy-MM-dd'));
  const [po, setPo] = useState('');
  const [status, setStatus] = useState<'paid' | 'pending'>('pending');
  const [invoiceItems, setInvoiceItems] = useState<InvoiceItem[]>([createEmptyItem()]);

  const [showCustomerSuggestions, setShowCustomerSuggestions] = useState(false);
  const [customerSuggestions, setCustomerSuggestions] = useState(customers);

  useEffect(() => {
    if (editId) {
      const invoice = invoices.find(inv => inv.id === editId);
      if (invoice) {
        setCustomerName(invoice.customerName);
        setGstin(invoice.gstin);
        setAddress(invoice.address);
        setInvoiceNumber(invoice.invoiceNumber);
        setDate(invoice.date);
        setPo(invoice.po);
        setStatus(invoice.status);
        setInvoiceItems(invoice.items);
      }
    } else {
      setInvoiceNumber(getNextInvoiceNumber());
    }
  }, [editId, invoices, getNextInvoiceNumber]);

  const handleCustomerSearch = (value: string) => {
    setCustomerName(value);
    const filtered = customers.filter(c => 
      c.name.toLowerCase().includes(value.toLowerCase())
    );
    setCustomerSuggestions(filtered);
    setShowCustomerSuggestions(value.length > 0 && filtered.length > 0);
  };

  const selectCustomer = (customer: typeof customers[0]) => {
    setCustomerName(customer.name);
    setGstin(customer.gstin);
    setAddress(customer.address);
    setShowCustomerSuggestions(false);
  };

  const addInvoiceItem = () => {
    setInvoiceItems([...invoiceItems, createEmptyItem()]);
  };

  const removeInvoiceItem = (id: string) => {
    if (invoiceItems.length > 1) {
      setInvoiceItems(invoiceItems.filter(item => item.id !== id));
    }
  };

  const updateInvoiceItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setInvoiceItems(invoiceItems.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        // Calculate amounts
        const rate = field === 'rate' ? Number(value) : item.rate;
        const qty = field === 'qty' ? Number(value) : item.qty;
        const cgstPercent = field === 'cgstPercent' ? Number(value) : item.cgstPercent;
        const sgstPercent = field === 'sgstPercent' ? Number(value) : item.sgstPercent;
        
        const baseAmount = rate * qty;
        const cgstAmount = baseAmount * (cgstPercent / 100);
        const sgstAmount = baseAmount * (sgstPercent / 100);
        
        updated.amount = baseAmount;
        updated.cgstAmount = cgstAmount;
        updated.sgstAmount = sgstAmount;
        updated.total = baseAmount + cgstAmount + sgstAmount;
        
        return updated;
      }
      return item;
    }));
  };

  const handleItemSelect = (itemId: string, invoiceItemId: string) => {
    const selectedItem = items.find(i => i.id === itemId);
    if (selectedItem) {
      setInvoiceItems(invoiceItems.map(item => {
        if (item.id === invoiceItemId) {
          const baseAmount = selectedItem.rate * item.qty;
          const cgstAmount = baseAmount * (item.cgstPercent / 100);
          const sgstAmount = baseAmount * (item.sgstPercent / 100);
          return {
            ...item,
            itemId: selectedItem.id,
            name: selectedItem.name,
            hsnCode: selectedItem.hsnCode,
            rate: selectedItem.rate,
            amount: baseAmount,
            cgstAmount,
            sgstAmount,
            total: baseAmount + cgstAmount + sgstAmount,
          };
        }
        return item;
      }));
    }
  };

  const calculations = useMemo(() => {
    const withoutGst = invoiceItems.reduce((sum, item) => sum + item.amount, 0);
    const cgstTotal = invoiceItems.reduce((sum, item) => sum + item.cgstAmount, 0);
    const sgstTotal = invoiceItems.reduce((sum, item) => sum + item.sgstAmount, 0);
    const gstAmount = cgstTotal + sgstTotal;
    const grandTotal = invoiceItems.reduce((sum, item) => sum + item.total, 0);
    return { withoutGst, cgstTotal, sgstTotal, gstAmount, grandTotal };
  }, [invoiceItems]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const handleSubmit = async () => {
    if (!customerName.trim()) {
      toast.error('Please enter customer name');
      return;
    }
    if (invoiceItems.some(item => !item.name.trim())) {
      toast.error('Please fill all item names');
      return;
    }

    try {
      // Auto-create customer if not exists
      let existingCustomer = getCustomerByName(customerName);
      if (!existingCustomer && customerName.trim()) {
        existingCustomer = await addCustomer({
          name: customerName.trim(),
          gstin: gstin.trim(),
          address: address.trim(),
        });
        toast.success(`Customer "${customerName}" added to your customers list`);
      }

      // Auto-create items if not exists
      for (const invItem of invoiceItems) {
        const existingItem = getItemByName(invItem.name);
        if (!existingItem && invItem.name.trim()) {
          await addItem({
            name: invItem.name.trim(),
            hsnCode: invItem.hsnCode.trim(),
            rate: invItem.rate,
          });
          toast.success(`Item "${invItem.name}" added to your items list`);
        }
      }

      const invoiceData = {
        customerId: existingCustomer?.id,
        customerName: customerName.trim(),
        gstin: gstin.trim(),
        address: address.trim(),
        invoiceNumber,
        date,
        po: po.trim(),
        items: invoiceItems,
        withoutGst: calculations.withoutGst,
        cgstTotal: calculations.cgstTotal,
        sgstTotal: calculations.sgstTotal,
        gstAmount: calculations.gstAmount,
        grandTotal: calculations.grandTotal,
        status,
        updatedAt: new Date().toISOString(),
      };

      if (editId) {
        await updateInvoice(editId, invoiceData);
        toast.success('Invoice updated successfully!');
      } else {
        await addInvoice(invoiceData);
        toast.success('Invoice created successfully!');
      }

      navigate('/sales-register');
    } catch (error: any) {
      console.error('Error saving invoice:', error);
      toast.error(error.message || 'Failed to save invoice');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">
            {editId ? 'Edit Invoice' : 'Create Invoice'}
          </h1>
          <p className="text-muted-foreground">Fill in the details to create a new invoice</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          {/* Customer Details */}
          <Card>
            <CardHeader>
              <CardTitle>Customer Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="relative">
                  <Label htmlFor="customerName">Customer Name (M/s) *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => handleCustomerSearch(e.target.value)}
                    placeholder="Enter or search customer"
                    className="mt-1"
                  />
                  {showCustomerSuggestions && (
                    <div className="absolute z-10 w-full mt-1 bg-card border rounded-lg shadow-lg max-h-40 overflow-y-auto">
                      {customerSuggestions.map((customer) => (
                        <button
                          key={customer.id}
                          className="w-full px-4 py-2 text-left hover:bg-accent transition-colors"
                          onClick={() => selectCustomer(customer)}
                        >
                          <p className="font-medium">{customer.name}</p>
                          <p className="text-xs text-muted-foreground">{customer.gstin}</p>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                <div>
                  <Label htmlFor="gstin">GSTIN No</Label>
                  <Input
                    id="gstin"
                    value={gstin}
                    onChange={(e) => setGstin(e.target.value)}
                    placeholder="e.g., 22AAAAA0000A1Z5"
                    className="mt-1"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="address">Address</Label>
                <Textarea
                  id="address"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="Enter customer address"
                  className="mt-1"
                  rows={2}
                />
              </div>
            </CardContent>
          </Card>

          {/* Invoice Details */}
          <Card>
            <CardHeader>
              <CardTitle>Invoice Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="invoiceNumber">Invoice Number *</Label>
                  <Input
                    id="invoiceNumber"
                    value={invoiceNumber}
                    onChange={(e) => setInvoiceNumber(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="date">Invoice Date *</Label>
                  <Input
                    id="date"
                    type="date"
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="po">Order No (Optional)</Label>
                  <Input
                    id="po"
                    value={po}
                    onChange={(e) => setPo(e.target.value)}
                    placeholder="Order/PO Number"
                    className="mt-1"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Items */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Items (Particulars)</CardTitle>
              <Button onClick={addInvoiceItem} size="sm" className="gap-1">
                <Plus size={16} />
                Add Item
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              {invoiceItems.map((item, index) => (
                <div key={item.id} className="p-4 bg-background rounded-lg border space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="font-medium text-sm text-muted-foreground">Item #{index + 1}</span>
                    {invoiceItems.length > 1 && (
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="h-8 w-8 text-destructive hover:bg-destructive/10"
                        onClick={() => removeInvoiceItem(item.id)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="col-span-2">
                      <Label>Particulars (Item Name) *</Label>
                      <div className="flex gap-2 mt-1">
                        <Input
                          value={item.name}
                          onChange={(e) => updateInvoiceItem(item.id, 'name', e.target.value)}
                          placeholder="Enter item name"
                          className="flex-1"
                        />
                        {items.length > 0 && (
                          <Select onValueChange={(val) => handleItemSelect(val, item.id)}>
                            <SelectTrigger className="w-32">
                              <SelectValue placeholder="Select" />
                            </SelectTrigger>
                            <SelectContent>
                              {items.map((i) => (
                                <SelectItem key={i.id} value={i.id}>
                                  {i.name}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      </div>
                    </div>
                    <div>
                      <Label>HSN</Label>
                      <Input
                        value={item.hsnCode}
                        onChange={(e) => updateInvoiceItem(item.id, 'hsnCode', e.target.value)}
                        placeholder="HSN Code"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>Rate (₹)</Label>
                      <Input
                        type="number"
                        value={item.rate || ''}
                        onChange={(e) => updateInvoiceItem(item.id, 'rate', parseFloat(e.target.value) || 0)}
                        placeholder="0.00"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>QTY</Label>
                      <Input
                        type="number"
                        value={item.qty === 1 ? '' : item.qty}
                        onChange={(e) => updateInvoiceItem(item.id, 'qty', parseInt(e.target.value) || 1)}
                        min={1}
                        placeholder=""
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label>CGST (%)</Label>
                      <Select 
                        value={String(item.cgstPercent)} 
                        onValueChange={(val) => updateInvoiceItem(item.id, 'cgstPercent', parseFloat(val))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="2.5">2.5%</SelectItem>
                          <SelectItem value="6">6%</SelectItem>
                          <SelectItem value="9">9%</SelectItem>
                          <SelectItem value="14">14%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>SGST (%)</Label>
                      <Select 
                        value={String(item.sgstPercent)} 
                        onValueChange={(val) => updateInvoiceItem(item.id, 'sgstPercent', parseFloat(val))}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="0">0%</SelectItem>
                          <SelectItem value="2.5">2.5%</SelectItem>
                          <SelectItem value="6">6%</SelectItem>
                          <SelectItem value="9">9%</SelectItem>
                          <SelectItem value="14">14%</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Total</Label>
                      <div className="mt-1 h-10 px-3 flex items-center bg-muted/30 rounded-md border font-semibold">
                        {formatCurrency(item.total)}
                      </div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-3 pt-2 border-t text-sm">
                    <div className="text-muted-foreground">
                      Amount: <span className="font-medium text-foreground">{formatCurrency(item.amount)}</span>
                    </div>
                    <div className="text-muted-foreground">
                      CGST ({item.cgstPercent}%): <span className="font-medium text-foreground">{formatCurrency(item.cgstAmount)}</span>
                    </div>
                    <div className="text-muted-foreground">
                      SGST ({item.sgstPercent}%): <span className="font-medium text-foreground">{formatCurrency(item.sgstAmount)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Summary */}
        <div className="space-y-6">
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Invoice Summary</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal (Amount)</span>
                  <span className="font-medium">{formatCurrency(calculations.withoutGst)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">CGST Total</span>
                  <span className="font-medium">{formatCurrency(calculations.cgstTotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">SGST Total</span>
                  <span className="font-medium">{formatCurrency(calculations.sgstTotal)}</span>
                </div>
                <div className="flex justify-between text-sm border-t pt-2">
                  <span className="text-muted-foreground">Total Tax Amount</span>
                  <span className="font-medium">{formatCurrency(calculations.gstAmount)}</span>
                </div>
                <div className="border-t pt-3">
                  <div className="flex justify-between">
                    <span className="font-semibold text-lg">Grand Total</span>
                    <span className="font-bold text-xl text-primary">
                      {formatCurrency(calculations.grandTotal)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t">
                <Label>Payment Status</Label>
                <Select value={status} onValueChange={(val: 'paid' | 'pending') => setStatus(val)}>
                  <SelectTrigger className="mt-1">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="paid">Paid</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button onClick={handleSubmit} className="w-full gap-2" size="lg">
                <Save size={20} />
                {editId ? 'Update Invoice' : 'Save Invoice'}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
