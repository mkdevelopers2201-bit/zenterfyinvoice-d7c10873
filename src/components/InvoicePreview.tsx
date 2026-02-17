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
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
  };

  const totals = {
    amount: invoice.items.reduce((sum, item) => sum + item.amount, 0),
    cgstAmount: invoice.items.reduce((sum, item) => sum + item.cgstAmount, 0),
    sgstAmount: invoice.items.reduce((sum, item) => sum + item.sgstAmount, 0),
    total: invoice.items.reduce((sum, item) => sum + item.total, 0),
  };

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: `
        @media print {
          @page { size: A4; margin: 0; }
          body { margin: 0; }
          #invoice-preview { 
            box-shadow: none !important; 
            border: none !important;
            margin: 0 !important;
            padding: 15mm !important;
          }
        }
      `}} />

      <div 
        className="bg-white p-8 mx-auto text-sm text-black border shadow-lg print:shadow-none" 
        id="invoice-preview"
        style={{ 
          width: '210mm', 
          minWidth: '210mm',
          backgroundColor: 'white'
        }}
      >
        {/* Company Header */}
        <div className="border-b-2 border-black pb-4 mb-4">
          <div className="flex justify-between text-[10px] text-gray-600 mb-2">
            <span>GSTIN - 24CMAPK3117Q1ZZ</span>
            <span>Mobile - 7990713846</span>
          </div>
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-black">S. K. ENTERPRISE</h1>
            <p className="text-[11px] font-medium mt-1 uppercase">TRADING IN MILIGIAN SPARE & PARTS OR BRASS PARTS</p>
            <p className="text-[10px] text-gray-700 leading-tight max-w-2xl mx-auto">
              SHOP NO 28, GOLDEN POINT, COMMERCIAL COMPLEX, NEAR SHIVOM CIRCLE, PHASE - III DARED, JAMNAGAR (GUJARAT) - 361 005
            </p>
          </div>
        </div>

        {/* Tax Invoice Title */}
        <div className="text-center border-y-2 border-black py-1.5 mb-4 bg-gray-50">
          <h2 className="text-2xl font-black uppercase tracking-widest">Tax - Invoice</h2>
        </div>

        {/* Customer & Invoice Info */}
        <div className="grid grid-cols-2 gap-8 mb-6 text-[11px]">
          <div className="space-y-1.5 border-r border-gray-200 pr-4">
            <p><span className="font-bold text-gray-900">M/s -</span> <span className="text-sm font-semibold uppercase">{invoice.customerName}</span></p>
            <p className="flex"><span className="font-bold text-gray-900 min-w-[60px]">Address -</span> <span>{invoice.address || '-'}</span></p>
            <p><span className="font-bold text-gray-900">GSTIN No -</span> {invoice.gstin || '-'}</p>
          </div>
          <div className="space-y-1.5 pl-4">
            <div className="flex justify-between"><span className="font-bold">Invoice Number:</span> <span className="font-semibold">{invoice.invoiceNumber}</span></div>
            <div className="flex justify-between"><span className="font-bold">Invoice Date:</span> <span>{format(new Date(invoice.date), 'dd/MM/yyyy')}</span></div>
            <div className="flex justify-between"><span className="font-bold">Reference Number:</span> <span>-</span></div>
            <div className="flex justify-between"><span className="font-bold">Order No.:</span> <span>{invoice.po || '-'}</span></div>
          </div>
        </div>

        {/* Items Table */}
        <div className="border border-black mb-6">
          <table className="w-full text-[11px] border-collapse">
            <thead>
              <tr className="border-b border-black bg-gray-100">
                <th className="border-r border-black py-2 px-1 text-center w-8" rowSpan={2}>Sr.</th>
                <th className="border-r border-black py-2 px-2 text-left" rowSpan={2}>Particulars</th>
                <th className="border-r border-black py-2 px-1 text-center w-12" rowSpan={2}>HSN</th>
                <th className="border-r border-black py-2 px-1 text-center w-10" rowSpan={2}>QTY</th>
                <th className="border-r border-black py-2 px-1 text-center w-16" rowSpan={2}>RATE</th>
                <th className="border-r border-black py-2 px-1 text-center w-20" rowSpan={2}>AMOUNT</th>
                <th className="border-r border-black py-1 px-1 text-center" colSpan={2}>CGST</th>
                <th className="border-r border-black py-1 px-1 text-center" colSpan={2}>SGST</th>
                <th className="py-2 px-1 text-center w-24" rowSpan={2}>TOTAL</th>
              </tr>
              <tr className="border-b border-black bg-gray-100">
                <th className="border-r border-black py-1 px-1 text-center w-10">%</th>
                <th className="border-r border-black py-1 px-1 text-center w-14">AMOUNT</th>
                <th className="border-r border-black py-1 px-1 text-center w-10">%</th>
                <th className="border-r border-black py-1 px-1 text-center w-14">AMOUNT</th>
              </tr>
            </thead>
            <tbody>
              {invoice.items.map((item, index) => (
                <tr key={item.id} className="border-b border-gray-300">
                  <td className="border-r border-black py-2 px-1 text-center">{index + 1}</td>
                  <td className="border-r border-black py-2 px-2 font-medium">{item.name}</td>
                  <td className="border-r border-black py-2 px-1 text-center">{item.hsnCode || '-'}</td>
                  <td className="border-r border-black py-2 px-1 text-center font-semibold">{item.qty}</td>
                  <td className="border-r border-black py-2 px-1 text-right">{formatNumber(item.rate)}</td>
                  <td className="border-r border-black py-2 px-1 text-right">{formatNumber(item.amount)}</td>
                  <td className="border-r border-black py-2 px-1 text-center">{item.cgstPercent}%</td>
                  <td className="border-r border-black py-2 px-1 text-right">{formatNumber(item.cgstAmount)}</td>
                  <td className="border-r border-black py-2 px-1 text-center">{item.sgstPercent}%</td>
                  <td className="border-r border-black py-2 px-1 text-right">{formatNumber(item.sgstAmount)}</td>
                  <td className="py-2 px-1 text-right font-bold">{formatNumber(item.total)}</td>
                </tr>
              ))}
              {Array.from({ length: Math.max(0, 8 - invoice.items.length) }).map((_, i) => (
                <tr key={`empty-${i}`} className="border-b border-gray-300 h-8">
                  <td className="border-r border-black">&nbsp;</td>
                  <td className="border-r border-black">&nbsp;</td>
                  <td className="border-r border-black">&nbsp;</td>
                  <td className="border-r border-black">&nbsp;</td>
                  <td className="border-r border-black">&nbsp;</td>
                  <td className="border-r border-black">&nbsp;</td>
                  <td className="border-r border-black">&nbsp;</td>
                  <td className="border-r border-black">&nbsp;</td>
                  <td className="border-r border-black">&nbsp;</td>
                  <td className="border-r border-black">&nbsp;</td>
                  <td>&nbsp;</td>
                </tr>
              ))}
              <tr className="bg-gray-100 font-bold border-t border-black">
                <td className="border-r border-black py-2 px-1"></td>
                <td className="border-r border-black py-2 px-2 uppercase italic text-[10px]">Grand Total Items Value</td>
                <td className="border-r border-black py-2 px-1"></td>
                <td className="border-r border-black py-2 px-1"></td>
                <td className="border-r border-black py-2 px-1"></td>
                <td className="border-r border-black py-2 px-1 text-right">{formatNumber(totals.amount)}</td>
                <td className="border-r border-black py-2 px-1"></td>
                <td className="border-r border-black py-2 px-1 text-right">{formatNumber(totals.cgstAmount)}</td>
                <td className="border-r border-black py-2 px-1"></td>
                <td className="border-r border-black py-2 px-1 text-right">{formatNumber(totals.sgstAmount)}</td>
                <td className="py-2 px-1 text-right text-sm underline decoration-double">{formatNumber(totals.total)}</td>
              </tr>
            </tbody>
          </table>
        </div>

        {/* Footer Section */}
        <div className="grid grid-cols-2 gap-8 mb-6 text-[11px]">
          <div className="space-y-4">
            <div>
              <p className="font-bold underline mb-1">Amount Chargeable (In words)</p>
              <p className="font-semibold uppercase leading-tight bg-gray-50 p-2 border border-dashed border-gray-300">
                RUPEES - {numberToWords(invoice.grandTotal)} ONLY
              </p>
            </div>
            <div className="text-[10px] space-y-1 border-l-2 border-black pl-3">
              <p className="font-bold">Bank Details:</p>
              <p><span className="font-semibold">Bank:</span> Kotak Mahindra Bank</p>
              <p><span className="font-semibold">A/c No:</span> 4711625484</p>
              <p><span className="font-semibold">IFSC:</span> KKBK0002936</p>
            </div>
          </div>
          <div>
            <table className="w-full border border-black border-collapse">
              <thead>
                <tr className="bg-gray-100 border-b border-black">
                  <th colSpan={2} className="py-1 px-2 text-center font-bold uppercase text-[10px]">Tax & Summary</th>
                </tr>
              </thead>
              <tbody className="font-medium">
                <tr className="border-b border-gray-200">
                  <td className="py-1.5 px-2 border-r border-black">Taxable Amount</td>
                  <td className="py-1.5 px-2 text-right">{formatNumber(totals.amount)}</td>
                </tr>
                <tr className="border-b border-gray-200 text-gray-700">
                  <td className="py-1 px-2 border-r border-black italic">Add: CGST</td>
                  <td className="py-1 px-2 text-right">{formatNumber(totals.cgstAmount)}</td>
                </tr>
                <tr className="border-b border-gray-200 text-gray-700">
                  <td className="py-1 px-2 border-r border-black italic">Add: SGST</td>
                  <td className="py-1 px-2 text-right">{formatNumber(totals.sgstAmount)}</td>
                </tr>
                {(invoice.roundOff !== undefined && invoice.roundOff !== 0) && (
                  <tr className="border-b border-gray-200">
                    <td className="py-1 px-2 border-r border-black italic text-gray-500">Round Off (+/-)</td>
                    <td className="py-1 px-2 text-right">{invoice.roundOff > 0 ? '+' : ''}{formatNumber(invoice.roundOff)}</td>
                  </tr>
                )}
                <tr className="font-black bg-gray-200 text-base">
                  <td className="py-2 px-2 border-r border-black">NET TOTAL</td>
                  <td className="py-2 px-2 text-right">{formatCurrency(invoice.grandTotal)}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Terms & Auth Sign */}
        <div className="grid grid-cols-2 gap-4 text-[10px] border-t-2 border-black pt-4">
          <div className="space-y-1">
            <p className="font-bold uppercase underline">Terms & Conditions:</p>
            <ol className="list-decimal list-inside space-y-0.5 text-gray-800 italic">
              <li>Goods are dispatched on buyer's risk.</li>
              <li>Interest @ 12% will be charged if not paid within 7 days.</li>
              <li>Subject to JAMNAGAR Jurisdiction only.</li>
            </ol>
          </div>
          <div className="text-right flex flex-col justify-between items-end">
            <div className="space-y-0.5">
              <p className="font-bold text-xs uppercase">For S. K. ENTERPRISE</p>
              <div className="h-14"></div>
              <p className="font-bold underline uppercase">Authorised Signature</p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
