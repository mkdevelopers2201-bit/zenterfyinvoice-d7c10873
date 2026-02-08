import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';
import { numberToWords } from '@/utils/numberToWords';

interface InvoicePreviewProps {
  invoice: Invoice;
}

export function InvoicePreview({ invoice }: InvoicePreviewProps) {
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

  const totals = {
    amount: invoice.items.reduce((sum, item) => sum + item.amount, 0),
    cgstAmount: invoice.items.reduce((sum, item) => sum + item.cgstAmount, 0),
    sgstAmount: invoice.items.reduce((sum, item) => sum + item.sgstAmount, 0),
    total: invoice.items.reduce((sum, item) => sum + item.total, 0),
  };

  return (
    <div className="bg-card p-6 rounded-lg shadow-sm border text-sm font-sans" id="invoice-preview">
      {/* Company Header */}
      <div className="border-b-2 border-foreground pb-3 mb-4">
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>GSTIN NO - 24CMAPK3117Q1ZZ</span>
          <span>79907 13846 94283 19484</span>
        </div>
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-wide">SK ENTERPRISE</h1>
          <p className="text-xs text-muted-foreground mt-1">SHOP NO 28. SHIV OM CIRCLE, GOLDEN POINT, DARED, PHASE III, JAMNAGAR</p>
        </div>
      </div>

      {/* Tax Invoice Title */}
      <div className="text-center border border-foreground py-2 mb-4">
        <h2 className="text-lg font-bold">TAX INVOICE</h2>
      </div>

      {/* Customer & Invoice Info */}
      <div className="grid grid-cols-2 gap-6 mb-4 text-xs">
        <div className="space-y-1">
          <div className="flex gap-2">
            <span className="font-medium w-16">BILLED</span>
            <span className="flex-1 border-b border-foreground/30 pb-1">{invoice.customerName}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium w-16">ADDRESS</span>
            <span className="flex-1 border-b border-foreground/30 pb-1">{invoice.address || '-'}</span>
          </div>
          <div className="flex gap-2">
            <span className="font-medium w-16">GSTIN</span>
            <span className="flex-1 border-b border-foreground/30 pb-1">{invoice.gstin || '-'}</span>
          </div>
        </div>
        <div className="space-y-1 text-right">
          <div className="flex gap-2 justify-end">
            <span className="flex-1 border-b border-foreground/30 pb-1 text-left">{invoice.invoiceNumber}</span>
            <span className="font-medium">INVOICE NUMBER</span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="flex-1 border-b border-foreground/30 pb-1 text-left">{format(new Date(invoice.date), 'dd/MM/yyyy')}</span>
            <span className="font-medium">DATED</span>
          </div>
          <div className="flex gap-2 justify-end">
            <span className="flex-1 border-b border-foreground/30 pb-1 text-left">{invoice.po || '-'}</span>
            <span className="font-medium">ORDER NUMBER</span>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="border border-foreground mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-foreground bg-muted/20">
              <th className="border-r border-foreground py-2 px-2 text-center w-12 font-bold">SR NO</th>
              <th className="border-r border-foreground py-2 px-2 text-center font-bold">PARTICULARS</th>
              <th className="border-r border-foreground py-2 px-2 text-center w-14 font-bold">HSN</th>
              <th className="border-r border-foreground py-2 px-2 text-center w-12 font-bold">QTY</th>
              <th className="border-r border-foreground py-2 px-2 text-center w-16 font-bold">RATE</th>
              <th className="py-2 px-2 text-center w-20 font-bold">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {invoice.items.map((item, index) => (
              <tr key={item.id} className="border-b border-foreground">
                <td className="border-r border-foreground py-2 px-2 text-center">{index + 1}</td>
                <td className="border-r border-foreground py-2 px-2">{item.name}</td>
                <td className="border-r border-foreground py-2 px-2 text-center">{item.hsnCode || '-'}</td>
                <td className="border-r border-foreground py-2 px-2 text-center">{item.qty}</td>
                <td className="border-r border-foreground py-2 px-2 text-right">{formatNumber(item.rate)}</td>
                <td className="py-2 px-2 text-right">{formatNumber(item.amount)}</td>
              </tr>
            ))}
            {/* Empty rows */}
            {Array.from({ length: Math.max(0, 8 - invoice.items.length) }).map((_, i) => (
              <tr key={`empty-${i}`} className="border-b border-foreground h-7">
                <td className="border-r border-foreground">&nbsp;</td>
                <td className="border-r border-foreground">&nbsp;</td>
                <td className="border-r border-foreground">&nbsp;</td>
                <td className="border-r border-foreground">&nbsp;</td>
                <td className="border-r border-foreground">&nbsp;</td>
                <td>&nbsp;</td>
              </tr>
            ))}
            {/* Total Row */}
            <tr className="bg-muted/20 font-bold">
              <td className="border-r border-foreground py-2 px-2"></td>
              <td className="border-r border-foreground py-2 px-2 text-center font-bold">TOTAL</td>
              <td className="border-r border-foreground py-2 px-2"></td>
              <td className="border-r border-foreground py-2 px-2"></td>
              <td className="border-r border-foreground py-2 px-2"></td>
              <td className="py-2 px-2 text-right font-bold">{formatNumber(totals.amount)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Amount in Words & Tax Summary */}
      <div className="grid grid-cols-2 gap-4 mb-4 text-xs">
        <div>
          <p className="font-bold mb-1">Amount in Words</p>
          <p>{numberToWords(invoice.grandTotal)}</p>
        </div>
        <div>
          <table className="w-full border border-foreground">
            <thead>
              <tr className="border-b border-foreground">
                <th className="border-r border-foreground" rowSpan={2}></th>
                <th className="border-r border-foreground py-1 px-1 text-center font-bold" colSpan={2}>CGST</th>
                <th className="border-r border-foreground py-1 px-1 text-center font-bold" colSpan={2}>SGST</th>
                <th className="py-1 px-1 text-center font-bold" rowSpan={2}>TOTAL</th>
              </tr>
              <tr className="border-b border-foreground">
                <th className="border-r border-foreground py-1 px-1 text-center text-[10px]">RATE</th>
                <th className="border-r border-foreground py-1 px-1 text-center text-[10px]">TAX</th>
                <th className="border-r border-foreground py-1 px-1 text-center text-[10px]">RATE</th>
                <th className="border-r border-foreground py-1 px-1 text-center text-[10px]">TAX</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-foreground">
                <td className="border-r border-foreground py-1 px-1"></td>
                <td className="border-r border-foreground py-1 px-1 text-center">{invoice.items[0]?.cgstPercent || 0}%</td>
                <td className="border-r border-foreground py-1 px-1 text-right">{formatNumber(totals.cgstAmount)}</td>
                <td className="border-r border-foreground py-1 px-1 text-center">{invoice.items[0]?.sgstPercent || 0}%</td>
                <td className="border-r border-foreground py-1 px-1 text-right">{formatNumber(totals.sgstAmount)}</td>
                <td className="py-1 px-1 text-right font-bold">{formatNumber(totals.cgstAmount + totals.sgstAmount)}</td>
              </tr>
            </tbody>
          </table>
          {/* Grand Total under tax box */}
          <div className="border border-foreground border-t-0 py-1 px-2 text-right">
            <span className="font-bold">TOTAL: </span>
            <span className="font-bold">{formatNumber(invoice.grandTotal)}</span>
          </div>
        </div>
      </div>

      {/* Bank Details & Signature */}
      <div className="grid grid-cols-2 gap-6 text-xs pt-3">
        <div>
          <p className="font-bold mb-1">BANK DETAILS</p>
          <p>AU Small Finance Bank</p>
          <p>2402212258785540.00</p>
          <p>AUBL0002142</p>
        </div>
        <div className="text-right">
          <p className="font-bold italic">for SK ENTERPRISE</p>
          <div className="h-12"></div>
          <p className="italic text-muted-foreground">Authorized Signature</p>
        </div>
      </div>

      {/* Thank you */}
      <div className="text-center mt-6 py-2 border border-foreground">
        <p className="font-bold text-xs">!! THANK YOU FOR YOUR BUSINESS !!</p>
      </div>
    </div>
  );
}
