import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';
import { numberToWords } from './numberToWords';

const formatNumber = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    minimumFractionDigits: 2, maximumFractionDigits: 2,
  }).format(amount);
};

interface GstSlab {
  hsnCode: string;
  cgstPercent: number;
  sgstPercent: number;
  taxableAmount: number;
  cgstAmount: number;
  sgstAmount: number;
  totalTax: number;
}

function groupByGstSlab(items: Invoice['items']): GstSlab[] {
  const map = new Map<string, GstSlab>();
  for (const item of items) {
    const key = `${item.hsnCode || '-'}_${item.cgstPercent}_${item.sgstPercent}`;
    const existing = map.get(key);
    if (existing) {
      existing.taxableAmount += item.amount;
      existing.cgstAmount += item.cgstAmount;
      existing.sgstAmount += item.sgstAmount;
      existing.totalTax += item.cgstAmount + item.sgstAmount;
    } else {
      map.set(key, {
        hsnCode: item.hsnCode || '-',
        cgstPercent: item.cgstPercent,
        sgstPercent: item.sgstPercent,
        taxableAmount: item.amount,
        cgstAmount: item.cgstAmount,
        sgstAmount: item.sgstAmount,
        totalTax: item.cgstAmount + item.sgstAmount,
      });
    }
  }
  return Array.from(map.values());
}

function getFinancialYear(dateStr: string): string {
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = d.getMonth(); // 0-based
  if (month >= 3) {
    return `${year}-${(year + 1).toString().slice(-2)}`;
  }
  return `${year - 1}-${year.toString().slice(-2)}`;
}

export function generateInvoicePDF(invoice: Invoice): void {
  const totals = {
    amount: invoice.items.reduce((sum, item) => sum + item.amount, 0),
    cgstAmount: invoice.items.reduce((sum, item) => sum + item.cgstAmount, 0),
    sgstAmount: invoice.items.reduce((sum, item) => sum + item.sgstAmount, 0),
    total: invoice.items.reduce((sum, item) => sum + item.total, 0),
  };

  const gstSlabs = groupByGstSlab(invoice.items);

  const itemRowsHTML = invoice.items.map((item, index) => `
    <tr>
      <td>${index + 1}</td>
      <td class="particulars">${item.name}</td>
      <td>${item.hsnCode || '-'}</td>
      <td>${item.qty}</td>
      <td class="amt">${formatNumber(item.rate)}</td>
      <td class="amt">${formatNumber(item.amount)}</td>
    </tr>
  `).join('');

  const emptyRowsCount = Math.max(0, 20 - invoice.items.length);
  const emptyRowsHTML = Array.from({ length: emptyRowsCount }).map(() => `
    <tr class="empty-row">
      <td>&nbsp;</td><td>&nbsp;</td>
      <td>&nbsp;</td><td>&nbsp;</td>
      <td>&nbsp;</td><td>&nbsp;</td>
    </tr>
  `).join('');

  const gstSlabRowsHTML = gstSlabs.map(slab => `
    <tr>
      <td>${slab.hsnCode}</td>
      <td>${slab.cgstPercent}%</td>
      <td class="amt">${formatNumber(slab.cgstAmount)}</td>
      <td>${slab.sgstPercent}%</td>
      <td class="amt">${formatNumber(slab.sgstAmount)}</td>
      <td class="amt" style="font-weight:bold">${formatNumber(slab.totalTax)}</td>
    </tr>
  `).join('');

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap" rel="stylesheet">
  <style>
    @page { size: A4 portrait; margin: 10mm 10mm 10mm 10mm; }
    * { box-sizing: border-box; }
    body { font-family: 'Poppins', Arial, sans-serif; font-size: 11px; color: #000; margin: 0; padding: 0; }
    .container { width: 100%; max-width: 190mm; margin: 0 auto; height: 277mm; display: flex; flex-direction: column; }
    .header { border-bottom: 1px solid #000; padding-bottom: 6px; margin-bottom: 8px; }
    .header-top { display: flex; justify-content: space-between; font-size: 10px; margin-bottom: 2px; }
    .company-name { text-align: center; font-size: 26px; font-weight: bold; margin: 2px 0; }
    .company-address { text-align: center; font-size: 9px; }
    .tax-title { text-align: center; border: 1px solid #000; padding: 4px 0; margin-bottom: 8px; font-size: 14px; font-weight: bold; }
    .info-section { display: flex; gap: 0; margin-bottom: 8px; font-size: 10px; }
    .info-left, .info-right { flex: 1; }
    .info-row { display: flex; gap: 6px; margin-bottom: 3px; align-items: center; }
    .info-label { font-weight: 600; min-width: 55px; white-space: nowrap; }
    .info-value { flex: 1; border-bottom: 1px solid #ccc; padding-bottom: 1px; }
    table { border-collapse: collapse; width: 100%; page-break-inside: avoid; }
    .items-table { border: 1px solid #000; margin-bottom: 8px; font-size: 10px; }
    .items-table th, .items-table td { border: 1px solid #000; padding: 3px 5px; text-align: center; vertical-align: middle; }
    .items-table th { font-weight: bold; background-color: #f5f5f5; }
    .items-table td.particulars { text-align: left; padding-left: 8px; }
    .items-table td.amt { text-align: right; }
    .items-table .empty-row td { border-left: 1px solid #000; border-right: 1px solid #000; border-top: none; border-bottom: none; height: 18px; }
    .total-row { font-weight: bold; background-color: #f5f5f5; }
    .summary-section { display: flex; gap: 10px; margin-bottom: 8px; }
    .summary-left { flex: 1.2; font-size: 10px; display: flex; flex-direction: column; justify-content: center; }
    .summary-right { flex: 0.8; }
    .tax-table { border: 1px solid #000; font-size: 10px; page-break-inside: avoid; }
    .tax-table th, .tax-table td { border: 1px solid #000; padding: 3px 5px; text-align: center; vertical-align: middle; }
    .tax-table th { font-weight: bold; }
    .tax-table td.amt { text-align: right; }
    .footer-section { display: flex; gap: 16px; border-top: 1px solid #000; padding-top: 6px; font-size: 9px; margin-top: auto; }
    .footer-left { flex: 1; }
    .footer-right { flex: 1; text-align: right; }
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
      <div class="info-left">
        <div class="info-row"><span class="info-label">BILLED</span><span class="info-value">${invoice.customerName}</span></div>
        <div class="info-row"><span class="info-label">ADDRESS</span><span class="info-value">${invoice.address || '-'}</span></div>
        <div class="info-row"><span class="info-label">GSTIN</span><span class="info-value">${invoice.gstin || '-'}</span></div>
      </div>
      <div class="info-right">
        <div class="info-row"><span class="info-value">${invoice.invoiceNumber}</span><span class="info-label" style="text-align:right;min-width:auto;margin-left:6px">INVOICE NO</span></div>
        <div class="info-row"><span class="info-value">${format(new Date(invoice.date), 'dd/MM/yyyy')}</span><span class="info-label" style="text-align:right;min-width:auto;margin-left:6px">DATED</span></div>
        <div class="info-row"><span class="info-value">${invoice.po || '-'}</span><span class="info-label" style="text-align:right;min-width:auto;margin-left:6px">ORDER NO</span></div>
      </div>
    </div>

    <table class="items-table">
      <thead>
        <tr>
          <th style="width:35px">SR NO</th>
          <th>PARTICULARS</th>
          <th style="width:50px">HSN</th>
          <th style="width:35px">QTY</th>
          <th style="width:55px">RATE</th>
          <th style="width:75px">AMOUNT</th>
        </tr>
      </thead>
      <tbody>
        ${itemRowsHTML}
        ${emptyRowsHTML}
        <tr class="total-row">
          <td></td>
          <td style="font-weight:bold">TOTAL</td>
          <td></td>
          <td></td>
          <td></td>
          <td class="amt" style="font-weight:bold">${formatNumber(totals.amount)}</td>
        </tr>
      </tbody>
    </table>

    <div class="summary-section">
      <div class="summary-left">
        <p style="margin:0 0 1px 0"><strong>GST Amount in Words</strong></p>
        <p style="margin:0 0 6px 0">${numberToWords(totals.cgstAmount + totals.sgstAmount)}</p>
        <p style="margin:0 0 1px 0"><strong>Grand Total in Words</strong></p>
        <p style="margin:0">${numberToWords(invoice.grandTotal)}</p>
      </div>
      <div class="summary-right">
        <table class="tax-table">
          <thead>
            <tr>
              <th rowspan="2">HSN</th>
              <th colspan="2">CGST</th>
              <th colspan="2">SGST</th>
              <th rowspan="2">TOTAL</th>
            </tr>
            <tr>
              <th style="font-size:9px">RATE</th>
              <th style="font-size:9px">TAX</th>
              <th style="font-size:9px">RATE</th>
              <th style="font-size:9px">TAX</th>
            </tr>
          </thead>
          <tbody>
            ${gstSlabRowsHTML}
          </tbody>
        </table>
        <div style="border:1px solid #000;border-top:0;padding:3px 5px;text-align:right;font-weight:bold;font-size:10px">
          TOTAL: ${formatNumber(invoice.grandTotal)}
        </div>
      </div>
    </div>

    <div class="footer-section">
      <div class="footer-left">
        <strong>BANK DETAILS</strong><br/>
        AU Small Finance Bank<br/>
        2402212258785540<br/>
        AUBL0002142
      </div>
      <div class="footer-right">
        <p style="font-weight:bold;font-style:italic;margin-bottom:40px">for SK ENTERPRISE</p>
        <p>Authorized Signature</p>
      </div>
    </div>
  </div>
</body>
</html>
`;

  // Generate PDF using html2pdf.js
  const element = document.createElement('div');
  element.innerHTML = htmlContent;
  document.body.appendChild(element);

  const customerSlug = invoice.customerName.replace(/[^a-zA-Z0-9]/g, '-').replace(/-+/g, '-');
  const fy = getFinancialYear(invoice.date);
  const filename = `${customerSlug}-${invoice.invoiceNumber}-${fy}.pdf`;

  import('html2pdf.js').then((html2pdfModule) => {
    const html2pdf = html2pdfModule.default;
    html2pdf()
      .set({
        margin: [10, 10, 10, 10],
        filename,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2, useCORS: true, logging: false },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
      })
      .from(element)
      .save()
      .then(() => {
        document.body.removeChild(element);
      })
      .catch(() => {
        document.body.removeChild(element);
      });
  });
}
