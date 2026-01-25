import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';
import { numberToWords } from '@/utils/numberToWords';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
    }).format(amount);
  };

  // Calculate column totals
  const totals = {
    amount: invoice.items.reduce((sum, item) => sum + item.amount, 0),
    cgstAmount: invoice.items.reduce((sum, item) => sum + item.cgstAmount, 0),
    sgstAmount: invoice.items.reduce((sum, item) => sum + item.sgstAmount, 0),
    total: invoice.items.reduce((sum, item) => sum + item.total, 0),
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border text-sm" id="invoice-preview">
      {/* Company Header */}
      <div className="border-b-2 border-foreground pb-4 mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-2">
          <span>GSTIN - 24CMAPK3117Q1ZZ</span>
          <span>Mobile - 7990713846</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-wide">S. K. ENTERPRISE</h1>
          <p className="text-xs text-muted-foreground mt-1">TRADING IN MILIGIAN SPARE & PARTS OR BRASS PARTS</p>
          <p className="text-xs text-muted-foreground">SHOP NO 28, GOLDEN POINT, COMMERCIAL COMPLEX, NEAR SHIVOM CIRCLE, PHASE - III DARED, JAMNAGAR (GUJARAT) - 361 005</p>
        </div>
      </div>

      {/* Tax Invoice Title */}
      <div className="text-center border-y-2 border-foreground py-2 mb-4">
        <h2 className="text-xl font-bold">Tax - Invoice</h2>
      </div>

      {/* Customer & Invoice Info */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
        <div className="space-y-1">
          <p><span className="font-semibold">M/s -</span> {invoice.customerName}</p>
          <p><span className="font-semibold">Address -</span> {invoice.address || '-'}</p>
          <p><span className="font-semibold">GSTIN No -</span> {invoice.gstin || '-'}</p>
        </div>
        <div className="space-y-1 text-right">
          <p><span className="font-semibold">Invoice Number:</span> {invoice.invoiceNumber}</p>
          <p><span className="font-semibold">Invoice Date:</span> {format(new Date(invoice.date), 'dd/MM/yyyy')}</p>
          <p><span className="font-semibold">Refrence Number:</span> -</p>
          <p><span className="font-semibold">Order No.:</span> {invoice.po || '-'}</p>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-foreground mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-foreground bg-muted/30">
              <th className="border-r border-foreground py-2 px-1 text-center w-8" rowSpan={2}>Sr.<br/>No.</th>
              <th className="border-r border-foreground py-2 px-2 text-left" rowSpan={2}>Particulars</th>
              <th className="border-r border-foreground py-2 px-1 text-center w-12" rowSpan={2}>HSN</th>
              <th className="border-r border-foreground py-2 px-1 text-center w-10" rowSpan={2}>QTY</th>
              <th className="border-r border-foreground py-2 px-1 text-center w-14" rowSpan={2}>RATE</th>
              <th className="border-r border-foreground py-2 px-1 text-center w-16" rowSpan={2}>AMOUNT</th>
              <th className="border-r border-foreground py-1 px-1 text-center" colSpan={2}>CGST</th>
              <th className="border-r border-foreground py-1 px-1 text-center" colSpan={2}>SGST</th>
              <th className="py-2 px-1 text-center w-16" rowSpan={2}>TOTAL</th>
            </tr>
            <tr className="border-b border-foreground bg-muted/30">
              <th className="border-r border-foreground py-1 px-1 text-center w-10">Tax %</th>
              <th className="border-r border-foreground py-1 px-1 text-center w-14">AMOUNT</th>
              <th className="border-r border-foreground py-1 px-1 text-center w-10">Tax %</th>
              <th className="border-r border-foreground py-1 px-1 text-center w-14">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id} className="border-b border-foreground">
                <td className="border-r border-foreground py-2 px-1 text-center">{index + 1}</td>
                <td className="border-r border-foreground py-2 px-2">{item.name}</td>
                <td className="border-r border-foreground py-2 px-1 text-center">{item.hsnCode || '-'}</td>
                <td className="border-r border-foreground py-2 px-1 text-center">{item.qty}</td>
                <td className="border-r border-foreground py-2 px-1 text-right">{formatNumber(item.rate)}</td>
                <td className="border-r border-foreground py-2 px-1 text-right">{formatNumber(item.amount)}</td>
                <td className="border-r border-foreground py-2 px-1 text-center">{item.cgstPercent}%</td>
                <td className="border-r border-foreground py-2 px-1 text-right">{formatNumber(item.cgstAmount)}</td>
                <td className="border-r border-foreground py-2 px-1 text-center">{item.sgstPercent}%</td>
                <td className="border-r border-foreground py-2 px-1 text-right">{formatNumber(item.sgstAmount)}</td>
                <td className="py-2 px-1 text-right font-medium">{formatNumber(item.total)}</td>
              </tr>
            ))}
            {/* Empty rows to fill space */}
            {Array.from({ length: Math.max(0, 5 - invoice.items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-foreground h-8">
                <td className="border-r border-foreground">&nbsp;</td>
                <td className="border-r border-foreground">&nbsp;</td>
                <td className="border-r border-foreground">&nbsp;</td>
                <td className="border-r border-foreground">&nbsp;</td>
                <td className="border-r border-foreground">&nbsp;</td>
                <td className="border-r border-foreground">&nbsp;</td>
                <td className="border-r border-foreground">&nbsp;</td>
                <td className="border-r border-foreground">&nbsp;</td>
                <td className="border-r border-foreground">&nbsp;</td>
                <td className="border-r border-foreground">&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            ))}
            {/* Grand Total Row */}
            <tr className="bg-muted/30 font-bold">
              <td className="border-r border-foreground py-2 px-1"></td>
              <td className="border-r border-foreground py-2 px-2">Grand Total</td>
              <td className="border-r border-foreground py-2 px-1"></td>
              <td className="border-r border-foreground py-2 px-1"></td>
              <td className="border-r border-foreground py-2 px-1"></td>
              <td className="border-r border-foreground py-2 px-1 text-right">{formatNumber(totals.amount)}</td>
              <td className="border-r border-foreground py-2 px-1"></td>
              <td className="border-r border-foreground py-2 px-1 text-right">{formatNumber(totals.cgstAmount)}</td>
              <td className="border-r border-foreground py-2 px-1"></td>
              <td className="border-r border-foreground py-2 px-1 text-right">{formatNumber(totals.sgstAmount)}</td>
              <td className="py-2 px-1 text-right">{formatNumber(totals.total)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in Words & GST Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
        <div className="space-y-2">
          <div>
            <p className="font-semibold">Amount Chargeble (In words)</p>
            <p className="font-medium">RUPEES - {numberToWords(totals.total)}</p>
          </div>
          <div>
            <p className="font-semibold">GST Amount (In words)</p>
            <p>RUPEES - {numberToWords(invoice.gstAmount)}</p>
          </div>
        </div>
        <div>
          <table className="w-full border border-foreground">
            <thead>
              <tr className="bg-muted/30">
                <th colSpan={2} className="py-1 px-2 text-center border-b border-foreground font-semibold">GST Amount</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-foreground">
                <td className="py-1 px-2 border-r border-foreground">CGST</td>
                <td className="py-1 px-2 text-right">{formatCurrency(totals.cgstAmount)}</td>
              </tr>
              <tr className="border-b border-foreground">
                <td className="py-1 px-2 border-r border-foreground">SGST</td>
                <td className="py-1 px-2 text-right">{formatCurrency(totals.sgstAmount)}</td>
              </tr>
              <tr className="font-bold bg-muted/30">
                <td className="py-1 px-2 border-r border-foreground">TOTAL TAX AMOUNT</td>
                <td className="py-1 px-2 text-right">{formatCurrency(invoice.gstAmount)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Terms & Bank Details */}
      <div className="grid grid-cols-2 gap-4 text-xs border-t pt-4">
        <div>
          <p className="font-semibold mb-1">Terms & Conditions</p>
          <ol className="list-decimal list-inside space-y-0.5 text-muted-foreground">
            <li>Goods are dispatched on buyer's risk</li>
            <li>Interest will be charges @ 12 % if bill is not paid within 7 days.</li>
            <li>In case of dispute only JAMNAGAR Court Will have JURISDICTION.</li>
          </ol>
          <div className="mt-3">
            <p className="font-semibold">Bank Details</p>
            <p>Kotak Bank A/c. Number :- 4711625484</p>
            <p>IFSC Code :- KKBK0002936</p>
          </div>
        </div>
        <div className="text-right">
          <p className="font-semibold italic">For S. K. Enterprise</p>
          <div className="h-16"></div>
          <p className="italic text-muted-foreground">Authorised Singture</p>
        </div>
      </div>
    </div>
  );
}
