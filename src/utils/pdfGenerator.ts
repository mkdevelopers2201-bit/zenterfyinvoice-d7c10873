import { Invoice } from "@/types/invoice";
import { numberToWords } from "./numberToWords";

export const generateInvoicePDF = (invoice: Invoice) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num || 0);
  };

  const totals = invoice.items.reduce((acc, item) => ({
    amount: acc.amount + (item.qty * item.rate),
  }), { amount: 0 });

  const itemsRowsHTML = invoice.items.map((item, index) => `
    <tr>
      <td style="width: 8%; border: 1px solid #000; text-align: center; vertical-align: middle;">${index + 1}</td>
      <td style="width: 42%; border: 1px solid #000; text-align: left; padding-left: 5px; vertical-align: middle;">${item.name}</td>
      <td style="width: 12%; border: 1px solid #000; text-align: center; vertical-align: middle;">${item.hsnCode || '-'}</td>
      <td style="width: 10%; border: 1px solid #000; text-align: center; vertical-align: middle;">${item.qty}</td>
      <td style="width: 13%; border: 1px solid #000; text-align: center; vertical-align: middle;">${formatNumber(item.rate)}</td>
      <td style="width: 15%; border: 1px solid #000; text-align: right; padding-right: 5px; vertical-align: middle;">${formatNumber(item.qty * item.rate)}</td>
    </tr>
  `).join('');

  return `
    <div style="font-family: Arial, sans-serif; padding: 20px; color: #000; background: white;">
      <div style="border: 1px solid #000;">
        <div style="text-align: center; border-bottom: 1px solid #000; padding: 10px;">
          <div style="font-size: 10px; text-align: left;">GSTIN: 24CMAPK3117QIZZ</div>
          <h1 style="margin: 0; font-size: 20px;">SK ENTERPRISE</h1>
          <div style="font-size: 9px;">SHOP NO 28, SHIV OM CIRCLE, GOLDEN POINT, DARED, PHASE III, JAMNAGAR</div>
          <h3 style="margin: 5px 0; text-decoration: underline;">TAX INVOICE</h3>
        </div>

        <table style="width: 100%; border-collapse: collapse; border-bottom: 1px solid #000;">
          <tr>
            <td style="width: 50%; border: none; border-right: 1px solid #000; text-align: left; padding: 10px; vertical-align: top;">
              <strong>BILLED TO:</strong><br>
              ${invoice.customerName}<br>
              ${invoice.customerAddress || ''}<br>
              GSTIN: ${invoice.customerGstin || '-'}
            </td>
            <td style="width: 50%; border: none; text-align: left; padding: 10px; vertical-align: top;">
              Invoice No: <strong>${invoice.invoiceNumber}</strong><br>
              Date: ${new Date(invoice.date).toLocaleDateString('en-GB')}
            </td>
          </tr>
        </table>

        <table style="width: 100%; border-collapse: collapse;">
          <thead>
            <tr style="background: #eee;">
              <th style="border: 1px solid #000; padding: 5px;">SR</th>
              <th style="border: 1px solid #000; padding: 5px; text-align: left;">PARTICULARS</th>
              <th style="border: 1px solid #000; padding: 5px;">HSN</th>
              <th style="border: 1px solid #000; padding: 5px;">QTY</th>
              <th style="border: 1px solid #000; padding: 5px;">RATE</th>
              <th style="border: 1px solid #000; padding: 5px; text-align: right;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHTML}
            <tr>
              <td colspan="5" style="border: 1px solid #000; text-align: right; padding: 5px; font-weight: bold;">TOTAL</td>
              <td style="border: 1px solid #000; text-align: right; padding: 5px; font-weight: bold;">${formatNumber(totals.amount)}</td>
            </tr>
          </tbody>
        </table>

        <div style="display: flex; border-top: 1px solid #000;">
          <div style="width: 60%; padding: 10px; border-right: 1px solid #000;">
            <strong>Amount in Words:</strong><br>
            ${numberToWords(invoice.grandTotal)}
          </div>
          <div style="width: 40%; padding: 10px; text-align: right;">
            <strong style="font-size: 14px;">Grand Total: ${formatNumber(invoice.grandTotal)}</strong>
          </div>
        </div>

        <div style="padding: 10px; border-top: 1px solid #000; font-size: 11px;">
          <strong>BANK DETAILS:</strong><br>
          AU Small Finance Bank | A/c No: 2402212258785540 | IFSC: AUBL0002142
        </div>

        <div style="padding: 10px; border-top: 1px solid #000; text-align: right; height: 70px;">
          For, <strong>SK ENTERPRISE</strong><br><br><br>
          Authorized Signatory
        </div>
      </div>
    </div>
  `;
};
