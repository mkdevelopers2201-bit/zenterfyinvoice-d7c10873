import { useState, useMemo } from 'react';
import { Invoice } from '@/types/invoice';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow 
} from '@/components/ui/table';
import { MultiSelect, MultiSelectOption } from '@/components/ui/multi-select';
import { BookOpen, Download, X } from 'lucide-react';
import { format, getYear, getMonth } from 'date-fns';
import { numberToWords } from '@/utils/numberToWords';

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency', currency: 'INR',
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount);
};

const formatNumber = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount);
};

interface LedgerEntry {
  date: string;
  particulars: string;
  debit: number;
  credit: number;
}

const YEAR_OPTIONS: MultiSelectOption[] = [2026, 2025, 2024, 2023].map(y => ({ value: String(y), label: String(y) }));
const MONTH_OPTIONS: MultiSelectOption[] = [
  { value: '0', label: 'January' }, { value: '1', label: 'February' },
  { value: '2', label: 'March' }, { value: '3', label: 'April' },
  { value: '4', label: 'May' }, { value: '5', label: 'June' },
  { value: '6', label: 'July' }, { value: '7', label: 'August' },
  { value: '8', label: 'September' }, { value: '9', label: 'October' },
  { value: '10', label: 'November' }, { value: '11', label: 'December' },
];

interface CustomerLedgerProps {
  customerId: string;
  customerName: string;
  invoices: Invoice[];
}

export function CustomerLedger({ customerId, customerName, invoices }: CustomerLedgerProps) {
  const [selectedYears, setSelectedYears] = useState<string[]>([]);
  const [selectedMonths, setSelectedMonths] = useState<string[]>([]);

  const ledgerEntries = useMemo(() => {
    const entries: LedgerEntry[] = [];

    // Sort invoices by date
    const sorted = [...invoices].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    sorted.forEach(inv => {
      // Debit entry - when invoice is created
      entries.push({
        date: inv.date,
        particulars: `Bill No: ${inv.invoiceNumber}`,
        debit: inv.grandTotal,
        credit: 0,
      });

      // Credit entry - when paid
      if (inv.status === 'paid') {
        entries.push({
          date: inv.date,
          particulars: `Payment Received - Bill ${inv.invoiceNumber}`,
          debit: 0,
          credit: inv.grandTotal,
        });
      }
    });

    // Sort by date
    entries.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    return entries;
  }, [invoices]);

  const filteredEntries = useMemo(() => {
    return ledgerEntries.filter(entry => {
      const d = new Date(entry.date);
      if (selectedYears.length > 0 && !selectedYears.includes(String(getYear(d)))) return false;
      if (selectedMonths.length > 0 && !selectedMonths.includes(String(getMonth(d)))) return false;
      return true;
    });
  }, [ledgerEntries, selectedYears, selectedMonths]);

  const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);
  const finalBalance = totalDebit - totalCredit;
  const hasActiveFilters = selectedYears.length > 0 || selectedMonths.length > 0;

  const handleExportPDF = () => {
    const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <style>
    @page { size: A4 portrait; margin: 15mm 12mm; }
    body { font-family: 'Poppins', Arial, sans-serif; font-size: 11px; color: #000; margin: 0; }
    .container { width: 100%; max-width: 210mm; margin: 0 auto; }
    .header { text-align: center; border-bottom: 2px solid #000; padding-bottom: 8px; margin-bottom: 15px; }
    .header-top { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 4px; }
    .company-name { font-size: 26px; font-weight: bold; margin: 4px 0; }
    .company-address { font-size: 9px; }
    .title { text-align: center; border: 1px solid #000; padding: 6px; margin-bottom: 15px; font-size: 14px; font-weight: bold; }
    .customer-info { margin-bottom: 15px; font-size: 11px; }
    table { width: 100%; border-collapse: collapse; margin-bottom: 15px; }
    th, td { border: 1px solid #000; padding: 6px 8px; }
    th { background-color: #f5f5f5; font-weight: bold; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .total-row { font-weight: bold; background-color: #f5f5f5; }
    .footer { display: flex; justify-content: space-between; margin-top: 20px; border-top: 1px solid #000; padding-top: 10px; }
    .bank-details { font-size: 9px; }
    .bank-details strong { font-size: 10px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="header-top">
        <span>GSTIN NO - 24CMAPK3117Q1ZZ</span>
        <span>79907 13846 94283 19484</span>
      </div>
      <div class="company-name">SK ENTERPRISE</div>
      <div class="company-address">SHOP NO 28. SHIV OM CIRCLE, GOLDEN POINT, DARED, PHASE III, JAMNAGAR</div>
    </div>

    <div class="title">CUSTOMER LEDGER - STATEMENT OF ACCOUNT</div>

    <div class="customer-info">
      <p><strong>Customer:</strong> ${customerName}</p>
      <p><strong>Period:</strong> ${hasActiveFilters ? 'Filtered' : 'All Time'}</p>
    </div>

    <table>
      <thead>
        <tr>
          <th>Date</th>
          <th>Particulars</th>
          <th class="text-right">Debit (₹)</th>
          <th class="text-right">Credit (₹)</th>
        </tr>
      </thead>
      <tbody>
        ${filteredEntries.map(e => `
          <tr>
            <td>${format(new Date(e.date), 'dd/MM/yyyy')}</td>
            <td>${e.particulars}</td>
            <td class="text-right">${e.debit > 0 ? formatNumber(e.debit) : '-'}</td>
            <td class="text-right">${e.credit > 0 ? formatNumber(e.credit) : '-'}</td>
          </tr>
        `).join('')}
        <tr class="total-row">
          <td colspan="2" class="text-right">TOTAL</td>
          <td class="text-right">${formatNumber(totalDebit)}</td>
          <td class="text-right">${formatNumber(totalCredit)}</td>
        </tr>
        <tr class="total-row">
          <td colspan="2" class="text-right">FINAL BALANCE (Outstanding)</td>
          <td colspan="2" class="text-right">${formatNumber(finalBalance)}</td>
        </tr>
      </tbody>
    </table>

    <p><strong>Balance in Words:</strong> ${numberToWords(Math.abs(finalBalance)).toUpperCase()}</p>

    <div class="footer">
      <div class="bank-details">
        <strong>BANK DETAILS</strong><br/>
        AU Small Finance Bank<br/>
        A/c: 2402212258785540.00<br/>
        IFSC: AUBL0002142
      </div>
      <div style="text-align: right;">
        <p><strong><em>for SK ENTERPRISE</em></strong></p>
        <br/><br/>
        <p>Authorized Signature</p>
      </div>
    </div>
  </div>
</body>
</html>`;

    const printWindow = window.open('', '_blank');
    if (printWindow) {
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      setTimeout(() => { printWindow.print(); }, 500);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <CardTitle className="flex items-center gap-2">
            <BookOpen size={20} /> Customer Ledger
          </CardTitle>
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Year:</span>
              <MultiSelect options={YEAR_OPTIONS} selected={selectedYears} onChange={setSelectedYears} placeholder="All" />
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Month:</span>
              <MultiSelect options={MONTH_OPTIONS} selected={selectedMonths} onChange={setSelectedMonths} placeholder="All" />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={() => { setSelectedYears([]); setSelectedMonths([]); }}>
                <X size={16} />
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleExportPDF} className="gap-1">
              <Download size={16} /> Export PDF
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {filteredEntries.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No ledger entries found. Create invoices for this customer to see ledger data.</p>
        ) : (
          <>
            <Table>
              <TableHeader>
                <TableRow className="bg-muted/30">
                  <TableHead>Date</TableHead>
                  <TableHead>Particulars</TableHead>
                  <TableHead className="text-right">Debit (₹)</TableHead>
                  <TableHead className="text-right">Credit (₹)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredEntries.map((entry, i) => (
                  <TableRow key={i}>
                    <TableCell>{format(new Date(entry.date), 'dd MMM yyyy')}</TableCell>
                    <TableCell>{entry.particulars}</TableCell>
                    <TableCell className="text-right">{entry.debit > 0 ? formatCurrency(entry.debit) : '-'}</TableCell>
                    <TableCell className="text-right">{entry.credit > 0 ? formatCurrency(entry.credit) : '-'}</TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/30 font-medium">
                  <TableCell colSpan={2} className="text-right">TOTAL</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalDebit)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(totalCredit)}</TableCell>
                </TableRow>
                <TableRow className="bg-primary/10 font-medium">
                  <TableCell colSpan={2} className="text-right">FINAL BALANCE (Outstanding)</TableCell>
                  <TableCell colSpan={2} className="text-right text-primary font-medium text-lg">
                    {formatCurrency(finalBalance)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
            <p className="text-sm text-muted-foreground mt-3">
              Balance in Words: <span className="font-medium text-foreground">{numberToWords(Math.abs(finalBalance))}</span>
            </p>
          </>
        )}
      </CardContent>
    </Card>
  );
}
