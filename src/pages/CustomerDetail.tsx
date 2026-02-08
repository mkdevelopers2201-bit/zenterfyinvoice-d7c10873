import { useState, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useData } from '@/context/DataContext';
import { useChallanData } from '@/hooks/useChallanData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { ArrowLeft, FileText, Receipt, BookOpen, X, Download } from 'lucide-react';
import { format, getYear, getMonth } from 'date-fns';
import { CustomerLedger } from '@/components/customer/CustomerLedger';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount);
};

const YEAR_OPTIONS: MultiSelectOption[] = [2026, 2025, 2024, 2023].map(y => ({ value: String(y), label: String(y) }));

const MONTH_OPTIONS: MultiSelectOption[] = [
  { value: '0', label: 'January' }, { value: '1', label: 'February' },
  { value: '2', label: 'March' }, { value: '3', label: 'April' },
  { value: '4', label: 'May' }, { value: '5', label: 'June' },
  { value: '6', label: 'July' }, { value: '7', label: 'August' },
  { value: '8', label: 'September' }, { value: '9', label: 'October' },
  { value: '10', label: 'November' }, { value: '11', label: 'December' },
];

export default function CustomerDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { customers, invoices } = useData();
  const { challans, bills, updateBill } = useChallanData();

  const [activeTab, setActiveTab] = useState('challans');
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  const customer = customers.find(c => c.id === id);

  const customerChallans = useMemo(() => {
    return challans
      .filter(c => c.customerId === id || c.customerName === customer?.name)
      .filter(c => {
        const d = new Date(c.date);
        if (selectedYears.length > 0 && !selectedYears.includes(String(getYear(d)))) return false;
        if (selectedMonths.length > 0 && !selectedMonths.includes(String(getMonth(d)))) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [challans, id, customer?.name, selectedYears, selectedMonths]);

  const customerBills = useMemo(() => {
    return bills
      .filter(b => b.customerId === id || b.customerName === customer?.name)
      .filter(b => {
        const d = new Date(b.date);
        if (selectedYears.length > 0 && !selectedYears.includes(String(getYear(d)))) return false;
        if (selectedMonths.length > 0 && !selectedMonths.includes(String(getMonth(d)))) return false;
        return true;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [bills, id, customer?.name, selectedYears, selectedMonths]);

  const customerInvoices = useMemo(() => {
    return invoices.filter(inv => inv.customerId === id || inv.customerName === customer?.name);
  }, [invoices, id, customer?.name]);

  const hasActiveFilters = selectedYears.length > 0 || selectedMonths.length > 0;

  if (!customer) {
    return (
      <div className="space-y-6">
        <Button variant="ghost" onClick={() => navigate('/customers')} className="gap-2">
          <ArrowLeft size={20} /> Back to Customers
        </Button>
        <p className="text-muted-foreground text-center py-12">Customer not found.</p>
      </div>
    );
  }

  const handleStatusChange = async (billId: string, status: 'paid' | 'unpaid') => {
    try {
      await updateBill(billId, { status });
    } catch (error) {
      console.error('Failed to update bill status');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" onClick={() => navigate('/customers')}>
          <ArrowLeft size={20} />
        </Button>
        <div>
          <h1 className="text-2xl font-medium text-foreground">{customer.name}</h1>
          <p className="text-muted-foreground text-sm">
            {customer.gstin && <span>GSTIN: {customer.gstin} • </span>}
            {customer.address && <span>{customer.address}</span>}
          </p>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Year:</span>
          <MultiSelect options={YEAR_OPTIONS} selected={selectedYears} onChange={setSelectedYears} placeholder="All Years" />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-muted-foreground">Month:</span>
          <MultiSelect options={MONTH_OPTIONS} selected={selectedMonths} onChange={setSelectedMonths} placeholder="All Months" />
        </div>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={() => { setSelectedYears([]); setSelectedMonths([]); }} className="gap-1 text-muted-foreground">
            <X size={16} /> Clear
          </Button>
        )}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="challans" className="gap-2">
            <FileText size={16} /> Delivery Challans
          </TabsTrigger>
          <TabsTrigger value="bills" className="gap-2">
            <Receipt size={16} /> Bills
          </TabsTrigger>
          <TabsTrigger value="ledger" className="gap-2">
            <BookOpen size={16} /> Ledger
          </TabsTrigger>
        </TabsList>

        <TabsContent value="challans" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText size={20} /> Challans ({customerChallans.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customerChallans.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No challans found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Challan No.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Previous</TableHead>
                      <TableHead className="text-right">Grand Total</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerChallans.map(c => (
                      <TableRow key={c.id}>
                        <TableCell className="font-medium">{c.challanNumber}</TableCell>
                        <TableCell>{format(new Date(c.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.currentAmount)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(c.previousBalance)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(c.grandTotal)}</TableCell>
                        <TableCell className="text-center">
                          <Badge variant={c.isBilled ? 'default' : 'secondary'}>
                            {c.isBilled ? 'Billed' : 'Pending'}
                          </Badge>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="bills" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Receipt size={20} /> Bills ({customerBills.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {customerBills.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">No bills found.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/30">
                      <TableHead>Bill No.</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead className="text-right">Subtotal</TableHead>
                      <TableHead className="text-right">GST</TableHead>
                      <TableHead className="text-right">Net Amount</TableHead>
                      <TableHead className="text-center">Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {customerBills.map(b => (
                      <TableRow key={b.id}>
                        <TableCell className="font-medium">{b.billNumber}</TableCell>
                        <TableCell>{format(new Date(b.date), 'dd MMM yyyy')}</TableCell>
                        <TableCell className="text-right">{formatCurrency(b.subtotal)}</TableCell>
                        <TableCell className="text-right">{formatCurrency(b.gstAmount)}</TableCell>
                        <TableCell className="text-right font-medium">{formatCurrency(b.netAmount)}</TableCell>
                        <TableCell className="text-center">
                          <Select value={b.status} onValueChange={(val: 'paid' | 'unpaid') => handleStatusChange(b.id, val)}>
                            <SelectTrigger className={`w-24 h-8 text-xs ${b.status === 'paid' ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="paid">Paid</SelectItem>
                              <SelectItem value="unpaid">Unpaid</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="ledger" className="mt-4">
          <CustomerLedger customerId={id!} customerName={customer.name} invoices={customerInvoices} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
