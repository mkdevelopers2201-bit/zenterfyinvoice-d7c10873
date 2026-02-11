import { Invoice } from "@/types/invoice";
import { numberToWords } from "./numberToWords";

export const generateInvoicePDF = (invoice: Invoice) => {
  const formatNumber = (num: number) => {
    return new Intl.NumberFormat('en-IN', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(num || 0);
  };

  // Pre-calculate totals to avoid logic inside the template
  const totals = invoice.items.reduce((acc, item) => ({
    amount: acc.amount + (item.qty * item.rate),
    cgstAmount: acc.cgstAmount + (item.cgstAmount || 0),
    sgstAmount: acc.sgstAmount + (item.sgstAmount || 0)
  }), { amount: 0, cgstAmount: 0, sgstAmount: 0 });

  // Map item rows safely
  const itemsRowsHTML = invoice.items.map((item, index) => `
    <tr>
      <td style="width: 40px;">${index + 1}</td>
      <td class="particulars-cell">${item.name}</td>
      <td>${item.hsnCode || '-'}</td>
      <td>${item.qty}</td>
      <td>${formatNumber(item.rate)}</td>
      <td class="amt">${formatNumber(item.qty * item.rate)}</td>
    </tr>
  `).join('');

  // Fixed Bank Account as a String
  const bankAccountNumber = "2402212258785540";

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <style>
        @page { size: A4; margin: 10mm; }
        body { font-family: sans-serif; font-size: 11px; margin: 0; padding: 0; color: #000; }
        .invoice-container { width: 100%; border: 1px solid #000; }
        
        .top-header { text-align: center; border-bottom: 1px solid #000; padding: 5px; }
        .company-name { font-size: 22px; font-weight: bold; margin: 0; }
        
        .billing-header { display: flex; width: 100%; border-bottom: 1px solid #000; }
        .billing-box { width: 50%; padding: 5px; border-right: 1px solid #000; }
        .details-box { width: 50%; padding: 5px; }

        table { width: 100%; border-collapse: collapse !important; table-layout: fixed; }
        th, td { 
          border: 1px solid #000 !important; 
          padding: 6px 4px !important; 
          vertical-align: middle !important; 
          text-align: center !important;
        }
        th { background-color: #f2f2f2; }
        .particulars-cell { text-align: left !important; padding-left: 8px !important; width: 40%; }
        .amt { text-align: right !important; padding-right: 8px !important; }

        .summary-wrapper { display: flex; width: 100%; border-top: 1px solid #000; }
        .words-section { width: 60%; padding: 8px; border-right: 1px solid #000; }
        .tax-section { width: 40%; padding: 5px; }
        
        .bank-info { padding: 10px; border-top: 1px solid #000; font-size: 10px; }
        .signature-box { text-align: right; padding: 10px; border-top: 1px solid #000; height: 60px; }
      </style>
    </head>
    <body>
      <div class="invoice-container">
        <div class="top-header">
          <p style="margin:0;">GSTIN NO: 24CMAPK3117QIZZ</p>
          <h1 class="company-name">SK ENTERPRISE</h1>
          <p style="margin:2px 0; font-size: 10px;">SHOP NO 28, SHIV OM CIRCLE, GOLDEN POINT, DARED, PHASE III, JAMNAGAR</p>
          <h2 style="margin: 5px 0; font-size: 14px; text-decoration: underline;">TAX INVOICE</h2>
        </div>

        <div class="billing-header">
          <div class="billing-box">
            <strong>BILLED TO:</strong><br/>
            ${invoice.customerName}<br/>
            ${invoice.customerAddress || ''}<br/>
            GSTIN: ${invoice.customerGstin || '-'}
          </div>
          <div class="details-box">
            Invoice No: <strong>${invoice.invoiceNumber}</strong><br/>
            Date: ${new Date(invoice.date).toLocaleDateString('en-GB')}
          </div>
        </div>

        <table>
          <thead>
            <tr>
              <th style="width: 40px;">SR</th>
              <th class="particulars-cell">PARTICULARS</th>
              <th>HSN</th>
              <th>QTY</th>
              <th>RATE</th>
              <th>AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${itemsRowsHTML}
            <tr>
              <td colspan="5" style="text-align: right !important; font-weight: bold;">TOTAL</td>
              <td class="amt" style="font-weight: bold;">${formatNumber(totals.amount)}</td>
            </tr>
          </tbody>
        </table>

        <div class="summary-wrapper">
          <div class="words-section">
            <strong>Grand Total in Words:</strong><br/>
            ${numberToWords(invoice.grandTotal)}
          </div>
          <div class="tax-section" style="text-align: right;">
            <strong>Grand Total: ${formatNumber(invoice.grandTotal)}</strong>
          </div>
        </div>

        <div class="bank-info">
          <strong>BANK DETAILS:</strong><br/>
          Bank Name: AU Small Finance Bank | 
          A/c No: ${bankAccountNumber} | 
          IFSC: AUBL0002142
        </div>

        <div class="signature-box">
          For, <strong>SK ENTERPRISE</strong><br/><br/><br/>
          Authorized Signatory
        </div>
      </div>
    </body>
    </html>
  `;
};
