import React from 'react';
import { format } from 'date-fns';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

interface InvoicePreviewProps {
  data: any;
  items: any[];
}

const InvoicePreview = ({ data, items }: InvoicePreviewProps) => {
  const calculateSubtotal = () => items.reduce((sum, item) => sum + (item.quantity * item.price), 0);
  const totalGst = items.reduce((sum, item) => sum + (item.total_gst || 0), 0);
  const grandTotal = calculateSubtotal() + totalGst;

  // Amount in Words Logic (Simple & Clean)
  const numberToWords = (num: number) => {
    return `Amount in Words: ${num.toLocaleString('en-IN')} Only`; // Temporary placeholder for words logic
  };

  return (
    <div className="w-[210mm] min-h-[297mm] p-8 bg-white mx-auto shadow-lg border border-gray-200 text-black font-sans" id="invoice-capture">
      {/* Header */}
      <div className="text-center mb-6 border-b-2 border-black pb-4">
        <p className="text-sm font-bold">GSTIN NO-24CMAPK3117Q1ZZ</p>
        <h1 className="text-3xl font-black uppercase mt-1">SK Enterprise</h1>
        <p className="text-xs uppercase mt-1">SHOP NO 28, SHIV OM CIRCLE, GOLDEN POINT, DARED, PHASE III, JAMNAGAR</p>
      </div>

      {/* Invoice Details Table */}
      <div className="grid grid-cols-2 border border-black mb-4">
        <div className="border-r border-black p-2">
          <p className="text-[10px] font-bold uppercase">Billed To:</p>
          <p className="font-bold">{data.customer_name || 'Customer Name'}</p>
          <p className="text-xs">{data.customer_address || 'Customer Address'}</p>
          <p className="text-xs font-bold mt-1">GSTIN: {data.customer_gstin || 'N/A'}</p>
        </div>
        <div className="p-2">
          <div className="flex justify-between border-b border-black pb-1 mb-1">
            <span className="text-[10px] font-bold uppercase">Invoice No:</span>
            <span className="font-bold">{data.invoice_number}</span>
          </div>
          <div className="flex justify-between border-b border-black pb-1 mb-1">
            <span className="text-[10px] font-bold uppercase">Date:</span>
            <span>{data.date ? format(new Date(data.date), 'dd/MM/yyyy') : ''}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-[10px] font-bold uppercase">Order No:</span>
            <span>{data.order_number || '-'}</span>
          </div>
        </div>
      </div>

      <h2 className="text-center font-bold border border-black bg-gray-100 py-1 mb-0 text-sm">TAX INVOICE</h2>

      {/* Main Items Table */}
      <table className="w-full border-collapse border border-black border-t-0 text-sm">
        <thead>
          <tr className="bg-gray-50 uppercase text-[10px]">
            <th className="border border-black p-1 w-10 text-center">SR.</th>
            <th className="border border-black p-1 text-left">Particulars</th>
            <th className="border border-black p-1 w-16 text-center">HSN</th>
            <th className="border border-black p-1 w-16 text-center">Qty</th>
            <th className="border border-black p-1 w-24 text-right">Rate</th>
            <th className="border border-black p-1 w-28 text-right">Amount</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index} className="h-8">
              <td className="border border-black p-1 text-center">{index + 1}</td>
              <td className="border border-black p-1">{item.description}</td>
              <td className="border border-black p-1 text-center">{item.hsn || '-'}</td>
              <td className="border border-black p-1 text-center">{item.quantity}</td>
              <td className="border border-black p-1 text-right">{item.price.toFixed(2)}</td>
              <td className="border border-black p-1 text-right">{(item.quantity * item.price).toFixed(2)}</td>
            </tr>
          ))}
          {/* Filler rows to maintain height if items are few */}
          {[...Array(Math.max(0, 5 - items.length))].map((_, i) => (
            <tr key={`filler-${i}`} className="h-8">
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
              <td className="border border-black p-1"></td>
            </tr>
          ))}
          {/* Total Row */}
          <tr>
            <td colSpan={5} className="border border-black p-1 text-right font-bold uppercase text-[10px]">Total</td>
            <td className="border border-black p-1 text-right font-bold">{calculateSubtotal().toFixed(2)}</td>
          </tr>
        </tbody>
      </table>

      {/* GST & Grand Total Section */}
      <div className="flex border border-black border-t-0">
        <div className="w-2/3 p-2 border-r border-black italic text-xs">
          {numberToWords(grandTotal)}
        </div>
        <div className="w-1/3">
          <div className="flex justify-between p-1 border-b border-black">
            <span className="text-[10px] font-bold px-1 uppercase">GST Total</span>
            <span className="font-bold px-1">{totalGst.toFixed(2)}</span>
          </div>
          <div className="flex justify-between p-1 bg-gray-100">
            <span className="text-[10px] font-bold px-1 uppercase">Grand Total</span>
            <span className="font-bold px-1 underline decoration-double">₹{grandTotal.toFixed(2)}</span>
          </div>
        </div>
      </div>

      {/* Footer / Signatory */}
      <div className="mt-12 flex justify-between items-end">
        <div className="text-[10px]">
          <p className="font-bold underline uppercase">Terms & Conditions:</p>
          <p>1. Goods once sold will not be taken back.</p>
          <p>2. Subject to Jamnagar Jurisdiction.</p>
        </div>
        <div className="text-center border-t border-black pt-1 w-48">
          <p className="text-[10px] font-bold uppercase">Authorized Signatory</p>
          <p className="text-[10px] mt-1 italic">for SK Enterprise</p>
        </div>
      </div>
    </div>
  );
};

export default InvoicePreview;
