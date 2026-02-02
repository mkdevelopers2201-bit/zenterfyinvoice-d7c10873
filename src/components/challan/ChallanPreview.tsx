import { DeliveryChallan } from '@/types/challan';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Printer } from 'lucide-react';

interface ChallanPreviewProps {
  challan: DeliveryChallan;
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
};

export function ChallanPreview({ challan }: ChallanPreviewProps) {
  const handlePrint = () => {
    const printContent = document.getElementById('challan-print-content');
    if (!printContent) return;

    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Delivery Challan - ${challan.challanNumber}</title>
          <style>
            @page { size: A4; margin: 15mm; }
            body { font-family: Arial, sans-serif; margin: 0; padding: 20px; color: #1e3a5f; }
            .header { display: flex; justify-content: space-between; margin-bottom: 30px; }
            .company-info { text-align: left; }
            .company-name { font-size: 24px; font-weight: bold; color: #1e3a5f; margin-bottom: 8px; }
            .company-address { font-size: 12px; color: #666; line-height: 1.5; }
            .challan-info { text-align: right; }
            .challan-title { font-size: 20px; font-weight: bold; color: #1e3a5f; margin-bottom: 8px; }
            .customer-info { text-align: right; margin-bottom: 20px; }
            .customer-name { font-size: 16px; font-weight: bold; color: #1e3a5f; }
            .customer-details { font-size: 12px; color: #666; }
            table { width: 100%; border-collapse: collapse; margin-bottom: 20px; }
            th, td { border: 1px solid #1e3a5f; padding: 10px; text-align: left; }
            th { background-color: #f0f4f8; color: #1e3a5f; font-weight: bold; }
            .text-right { text-align: right; }
            .totals { width: 300px; margin-left: auto; }
            .totals-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #ddd; }
            .grand-total { font-weight: bold; font-size: 16px; border-bottom: 2px solid #1e3a5f; }
            .footer { margin-top: 60px; text-align: right; }
            .signature { border-top: 1px solid #1e3a5f; display: inline-block; padding-top: 8px; min-width: 200px; }
          </style>
        </head>
        <body>
          ${printContent.innerHTML}
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.print();
  };

  return (
    <div>
      <div className="mb-4 flex justify-end">
        <Button onClick={handlePrint} className="gap-2 bg-[#1e3a5f] hover:bg-[#2d4a6f]">
          <Printer size={16} />
          Print
        </Button>
      </div>

      <div id="challan-print-content" className="bg-white p-8 border rounded-lg">
        {/* Header */}
        <div className="flex justify-between items-start mb-8">
          <div>
            <h1 className="text-2xl font-bold text-[#1e3a5f]">SK ENTERPRISE</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Shop No 28, Shiv Om<br />
              Circle, Golden Point,<br />
              Dared, Jamnagar
            </p>
          </div>
          <div className="text-right">
            <h2 className="text-xl font-bold text-[#1e3a5f]">DELIVERY CHALLAN</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Dated - {format(new Date(challan.date), 'dd/MM/yy')}
            </p>
            <p className="text-sm text-muted-foreground">
              Challan Number - {challan.challanNumber}
            </p>
          </div>
        </div>

        {/* Customer Info */}
        <div className="text-right mb-8">
          <h3 className="text-lg font-bold text-[#1e3a5f]">{challan.customerName}</h3>
          {challan.customerAddress && (
            <p className="text-sm text-muted-foreground">{challan.customerAddress}</p>
          )}
          {challan.customerPhone && (
            <p className="text-sm text-muted-foreground">{challan.customerPhone}</p>
          )}
        </div>

        {/* Items Table */}
        <table className="w-full border-collapse mb-6">
          <thead>
            <tr className="bg-[#f0f4f8]">
              <th className="border border-[#1e3a5f] p-3 text-left text-[#1e3a5f]">Particulars</th>
              <th className="border border-[#1e3a5f] p-3 text-center text-[#1e3a5f] w-24">QTY</th>
              <th className="border border-[#1e3a5f] p-3 text-right text-[#1e3a5f] w-28">Rate</th>
              <th className="border border-[#1e3a5f] p-3 text-right text-[#1e3a5f] w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {challan.items.map((item, index) => (
              <tr key={item.id || index}>
                <td className="border border-[#1e3a5f] p-3">{item.name}</td>
                <td className="border border-[#1e3a5f] p-3 text-center">{item.qty}</td>
                <td className="border border-[#1e3a5f] p-3 text-right">{formatCurrency(item.rate)}</td>
                <td className="border border-[#1e3a5f] p-3 text-right">{formatCurrency(item.total)}</td>
              </tr>
            ))}
            {/* Empty rows to fill space */}
            {Array.from({ length: Math.max(0, 5 - challan.items.length) }).map((_, i) => (
              <tr key={`empty-${i}`}>
                <td className="border border-[#1e3a5f] p-3">&nbsp;</td>
                <td className="border border-[#1e3a5f] p-3"></td>
                <td className="border border-[#1e3a5f] p-3"></td>
                <td className="border border-[#1e3a5f] p-3"></td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totals */}
        <div className="flex justify-end">
          <div className="w-72">
            <div className="flex justify-between py-2 border-b">
              <span>Amount</span>
              <span>{formatCurrency(challan.currentAmount)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>Previous Balance</span>
              <span>{formatCurrency(challan.previousBalance)}</span>
            </div>
            <div className="flex justify-between py-2 border-b">
              <span>This Challan</span>
              <span>{formatCurrency(challan.currentAmount)}</span>
            </div>
            <div className="flex justify-between py-2 border-b-2 border-[#1e3a5f] font-bold text-[#1e3a5f]">
              <span>Grand Total</span>
              <span>{formatCurrency(challan.grandTotal)}</span>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-16 text-right">
          <p className="italic text-[#1e3a5f] mb-2">For SK ENTERPRISE</p>
          <div className="inline-block border-t border-[#1e3a5f] pt-2 min-w-[200px]">
            <p className="text-sm text-muted-foreground">Authorized Signatory</p>
          </div>
        </div>
      </div>
    </div>
  );
}
