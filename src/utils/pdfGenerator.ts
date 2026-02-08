import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';
import { numberToWords } from './numberToWords';

const formatNumber = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount);
};

export function generateInvoicePDF(invoice: Invoice): void {
  const totals = {
    amount: invoice.items.reduce((sum, item) => sum + item.amount, 0),
    cgstAmount: invoice.items.reduce((sum, item) => sum + item.cgstAmount, 0),
    sgstAmount: invoice.items.reduce((sum, item) => sum + item.sgstAmount, 0),
    total: invoice.items.reduce((sum, item) => sum + item.total, 0),
  };

  const itemRowsHTML = invoice.items.map((item, index) => `
    <tr>
      <td class="border-r py-2 px-2 text-center">${index + 1}</td>
      <td class="border-r py-2 px-2">${item.name}</td>
      <td class="border-r py-2 px-2 text-center">${item.hsnCode || '-'}</td>
      <td class="border-r py-2 px-2 text-center">${item.qty}</td>
      <td class="border-r py-2 px-2 text-right">${formatNumber(item.rate)}</td>
      <td class="py-2 px-2 text-right">${formatNumber(item.amount)}</td>
    </tr>
  `).join('');

  const emptyRowsCount = Math.max(0, 20 - invoice.items.length);
  const emptyRowsHTML = Array.from({ length: emptyRowsCount }).map(() => `
    <tr>
      <td class="border-r h-7">&nbsp;</td><td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td><td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td><td>&nbsp;</td>
    </tr>
  `).join('');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 12mm 10mm 12mm 10mm; }
    body { font-family: 'Poppins', Arial, sans-serif; font-size: 11px; color: #000; margin: 0; }
    .container { width: 100%; max-width: 210mm; margin: 0 auto; }
    .header { border-bottom: 2px solid #000; padding-bottom: 6px; margin-bottom: 10px; }
    .header-top { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px; }
    .company-name { text-align: center; font-size: 28px; font-weight: bold; margin: 4px 0; }
    .company-address { text-align: center; font-size: 9px; }
    .tax-title { text-align: center; border: 1px solid #000; padding: 6px 0; margin-bottom: 12px; font-size: 15px; font-weight: bold; }
    .info-section { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; margin-bottom: 12px; font-size: 10px; }
    .info-row { display: flex; gap: 6px; margin-bottom: 4px; }
    .info-label { font-weight: 600; min-width: 60px; }
    .info-value { flex: 1; border-bottom: 1px solid #ccc; padding-bottom: 2px; }
    .items-table { width: 100%; border-collapse: collapse; border: 1px solid #000; margin-bottom: 10px; font-size: 10px; }
    .items-table th, .items-table td { border: 1px solid #000; padding: 4px 6px; }
    .items-table th { font-weight: bold; background-color: #f5f5f5; }
    .total-row { font-weight: bold; background-color: #f5f5f5; }
    .summary-section { display: grid; grid-template-columns: 1.2fr 0.8fr; gap: 12px; margin-bottom: 12px; }
    .tax-table { width: 100%; border-collapse: collapse; border: 1px solid #000; font-size: 10px; }
    .tax-table th, .tax-table td { border: 1px solid #000; padding: 4px 6px; }
    .tax-table th { font-weight: bold; }
    .footer-section { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; border-top: 1px solid #000; padding-top: 8px; font-size: 9px; }
    .text-right { text-align: right; }
    .text-center { text-align: center; }
    .thank-you { text-align: center; border: 1px solid #000; padding: 8px; margin-top: 20px; font-weight: bold; font-size: 11px; }
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

    <div class="tax-title">TAX INVOICE</div>

    <div class="info-section">
      <div>
        <div class="info-row"><span class="info-label">BILLED</span><span class="info-value">${invoice.customerName}</span></div>
        <div class="info-row"><span class="info-label">ADDRESS</span><span class="info-value">${invoice.address || '-'}</span></div>
        <div class="info-row"><span class="info-label">GSTIN</span><span class="info-value">${invoice.gstin || '-'}</span></div>
      </div>
      <div>
        <div class="info-row"><span class="info-value">${invoice.invoiceNumber}</span><span class="info-label text-right">INVOICE NUMBER</span></div>
        <div class="info-row"><span class="info-value">${format(new Date(invoice.date), 'dd/MM/yyyy')}</span><span class="info-label text-right">DATED</span></div>
        <div class="info-row"><span class="info-value">${invoice.po || '-'}</span><span class="info-label text-right">ORDER NUMBER</span></div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width:40px">SR NO</th>
          <th>PARTICULARS</th>
          <th style="width:50px">HSN</th>
          <th style="width:40px">QTY</th>
          <th style="width:60px">RATE</th>
          <th style="width:80px">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHTML}
        ${emptyRowsHTML}
        <tr class="total-row">
          <td class="border-r"></td>
          <td class="border-r text-center" style="font-weight:bold">TOTAL</td>
          <td class="border-r"></td>
          <td class="border-r"></td>
          <td class="border-r"></td>
          <td class="text-right" style="font-weight:bold">${formatNumber(totals.amount)}</td>
        </tr>
      </tbody>
    </table>

    <div class="summary-section">
      <div>
        <p style="margin-bottom:4px"><strong>Amount in Words</strong></p>
        <p>${numberToWords(invoice.grandTotal)}</p>
      </div>
      <div>
        <table class="tax-table">
          <thead>
            <tr>
              <th rowspan="2"></th>
              <th colspan="2" class="text-center">CGST</th>
              <th colspan="2" class="text-center">SGST</th>
              <th rowspan="2" class="text-center">TOTAL</th>
            </tr>
            <tr>
              <th class="text-center" style="font-size:9px">RATE</th>
              <th class="text-center" style="font-size:9px">TAX</th>
              <th class="text-center" style="font-size:9px">RATE</th>
              <th class="text-center" style="font-size:9px">TAX</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td></td>
              <td class="text-center">${invoice.items[0]?.cgstPercent || 0}%</td>
              <td class="text-right">${formatNumber(totals.cgstAmount)}</td>
              <td class="text-center">${invoice.items[0]?.sgstPercent || 0}%</td>
              <td class="text-right">${formatNumber(totals.sgstAmount)}</td>
              <td class="text-right" style="font-weight:bold">${formatNumber(totals.cgstAmount + totals.sgstAmount)}</td>
            </tr>
          </tbody>
        </table>
        <div style="border:1px solid #000;border-top:0;padding:4px 6px;text-align:right;font-weight:bold">
          TOTAL: ${formatNumber(invoice.grandTotal)}
        </div>
      </div>
    </div>

    <div class="footer-section">
      <div>
        <strong>BANK DETAILS</strong><br/>
        AU Small Finance Bank<br/>
        2402212258785540.00<br/>
        AUBL0002142
      </div>
      <div class="text-right">
        <p style="font-weight:bold;font-style:italic;margin-bottom:40px">for SK ENTERPRISE</p>
        <p>Authorized Signature</p>
      </div>
    </div>

    <div class="thank-you">!! THANK YOU FOR YOUR BUSINESS !!</div>
  </div>
</body>
</html>
`;

  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  }
}
