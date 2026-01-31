import { useState, useMemo } from 'react';
import { useData } from '@/context/DataContext';
import { StatCard } from '@/components/ui/stat-card';
import { FileText, Users, Package, IndianRupee, Clock, CheckCircle, Eye, X } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import { Badge } from '@/components/ui/badge';
import { format, getYear, getMonth } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InvoicePreview } from '@/components/InvoicePreview';
import { Invoice } from '@/types/invoice';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';

const MONTH_OPTIONS: MultiSelectOption[] = [
  { value: '0', label: 'January' },
  { value: '1', label: 'February' },
  { value: '2', label: 'March' },
  { value: '3', label: 'April' },
  { value: '4', label: 'May' },
  { value: '5', label: 'June' },
  { value: '6', label: 'July' },
  { value: '7', label: 'August' },
  { value: '8', label: 'September' },
  { value: '9', label: 'October' },
  { value: '10', label: 'November' },
  { value: '11', label: 'December' },
];

export default function Dashboard() {
  const { invoices, customers, items } = useData();
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null);
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  // Fixed year options from 2023 to 2025
  const yearOptions: MultiSelectOption[] = useMemo(() => {
    return [2025, 2024, 2023].map(year => ({ value: String(year), label: String(year) }));
  }, []);

  // Filter invoices based on selected years and months
  const filteredInvoices = useMemo(() => {
    return invoices.filter(inv => {
      const invoiceDate = new Date(inv.date);
      const invoiceYear = getYear(invoiceDate);
      const invoiceMonth = getMonth(invoiceDate);

      // Year filter
      if (selectedYears.length > 0 && !selectedYears.includes(String(invoiceYear))) {
        return false;
      }

      // Month filter
      if (selectedMonths.length > 0 && !selectedMonths.includes(String(invoiceMonth))) {
        return false;
      }

      return true;
    });
  }, [invoices, selectedYears, selectedMonths]);

  const hasActiveFilters = selectedYears.length > 0 || selectedMonths.length > 0;

  const clearFilters = () => {
    setSelectedYears([]);
    setSelectedMonths([]);
  };

  const totalRevenue = filteredInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);
  const paidInvoices = filteredInvoices.filter(inv => inv.status === 'paid');
  const pendingInvoices = filteredInvoices.filter(inv => inv.status === 'pending');
  const pendingAmount = pendingInvoices.reduce((sum, inv) => sum + inv.grandTotal, 0);

  const recentInvoices = [...filteredInvoices]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0,
    }).format(amount);
  };

  return (
    <div className="space-y-8">
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Dashboard</h1>
          <p className="text-muted-foreground mt-1">Welcome back! Here's your business overview.</p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Year:</span>
            <MultiSelect
              options={yearOptions}
              selected={selectedYears}
              onChange={setSelectedYears}
              placeholder="All Years"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-muted-foreground">Month:</span>
            <MultiSelect
              options={MONTH_OPTIONS}
              selected={selectedMonths}
              onChange={setSelectedMonths}
              placeholder="All Months"
            />
          </div>
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="gap-1 text-muted-foreground hover:text-foreground"
            >
              <X size={16} />
              Clear
            </Button>
          )}
          <Link to="/create-invoice">
            <Button size="lg" className="gap-2">
              <FileText size={20} />
              Create Invoice
            </Button>
          </Link>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          icon={<IndianRupee className="h-6 w-6 text-accent-foreground" />}
        />
        <StatCard
          title="Total Invoices"
          value={invoices.length}
          icon={<FileText className="h-6 w-6 text-accent-foreground" />}
        />
        <StatCard
          title="Pending Amount"
          value={formatCurrency(pendingAmount)}
          icon={<Clock className="h-6 w-6 text-accent-foreground" />}
        />
        <StatCard
          title="Paid Invoices"
          value={paidInvoices.length}
          icon={<CheckCircle className="h-6 w-6 text-accent-foreground" />}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Invoices</CardTitle>
            <Link to="/sales-register">
              <Button variant="ghost" size="sm">View All</Button>
            </Link>
          </CardHeader>
          <CardContent>
            {recentInvoices.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                <FileText className="h-12 w-12 mx-auto mb-3 opacity-50" />
                <p>No invoices yet. Create your first invoice!</p>
              </div>
            ) : (
              <div className="space-y-3">
                {recentInvoices.map((invoice) => (
                  <div 
                    key={invoice.id} 
                    className="flex items-center justify-between p-4 bg-card rounded-lg border"
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <span className="font-semibold text-foreground">{invoice.invoiceNumber}</span>
                        <Badge variant={invoice.status === 'paid' ? 'default' : 'secondary'}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">{invoice.customerName}</p>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <p className="font-semibold text-foreground">{formatCurrency(invoice.grandTotal)}</p>
                        <p className="text-xs text-muted-foreground">
                          {format(new Date(invoice.date), 'dd MMM yyyy')}
                        </p>
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setSelectedInvoice(invoice)}
                        title="View Invoice"
                      >
                        <Eye size={16} />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users size={20} />
                Customers
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{customers.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Total customers</p>
              <Link to="/customers">
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  Manage Customers
                </Button>
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Package size={20} />
                Items
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-4xl font-bold text-foreground">{items.length}</div>
              <p className="text-sm text-muted-foreground mt-1">Stock items</p>
              <Link to="/items">
                <Button variant="outline" size="sm" className="mt-4 w-full">
                  Manage Items
                </Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* View Invoice Dialog */}
      <Dialog open={!!selectedInvoice} onOpenChange={() => setSelectedInvoice(null)}>
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Invoice Preview</DialogTitle>
          </DialogHeader>
          {selectedInvoice && (
            <div className="space-y-4">
              <InvoicePreview invoice={selectedInvoice} />
              <div className="flex justify-end">
                <Button variant="outline" onClick={() => setSelectedInvoice(null)}>
                  Close
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
