import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';
import { numberToWords } from './numberToWords';

const formatNumber = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  }).format(amount);
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 2,
  }).format(amount);
};

export function generateInvoicePDF(invoice: Invoice): void {
  // Calculate totals
  const totals = {
    amount: invoice.items.reduce((sum, item) => sum + item.amount, 0),
    cgstAmount: invoice.items.reduce((sum, item) => sum + item.cgstAmount, 0),
    sgstAmount: invoice.items.reduce((sum, item) => sum + item.sgstAmount, 0),
    total: invoice.items.reduce((sum, item) => sum + item.total, 0),
  };

  // Generate item rows HTML
  const itemRowsHTML = invoice.items.map((item, index) => `
    <tr>
      <td class="border-r py-2 px-1 text-center">${index + 1}</td>
      <td class="border-r py-2 px-2">${item.name}</td>
      <td class="border-r py-2 px-1 text-center">${item.hsnCode || '-'}</td>
      <td class="border-r py-2 px-1 text-center">${item.qty}</td>
      <td class="border-r py-2 px-1 text-right">${formatNumber(item.rate)}</td>
      <td class="border-r py-2 px-1 text-right">${formatNumber(item.amount)}</td>
      <td class="border-r py-2 px-1 text-center">${item.cgstPercent}%</td>
      <td class="border-r py-2 px-1 text-right">${formatNumber(item.cgstAmount)}</td>
      <td class="border-r py-2 px-1 text-center">${item.sgstPercent}%</td>
      <td class="border-r py-2 px-1 text-right">${formatNumber(item.sgstAmount)}</td>
      <td class="py-2 px-1 text-right font-medium">${formatNumber(item.total)}</td>
    </tr>
  `).join('');

  // Generate empty rows to fill space (minimum 19 rows like the reference)
  const emptyRowsCount = Math.max(0, 19 - invoice.items.length);
  const emptyRowsHTML = Array.from({ length: emptyRowsCount }).map(() => `
    <tr>
      <td class="border-r h-8">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td class="border-r">&nbsp;</td>
      <td>&nbsp;</td>
    </tr>
  `).join('');

  // Create the HTML content matching InvoicePreview exactly
  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>Invoice ${invoice.invoiceNumber}</title>
  <style>
    @page {
      size: A3 portrait;
      margin: 8mm;
    }
    
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: Arial, sans-serif;
      font-size: 11px;
      color: #000;
      background: #fff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    
    .invoice-container {
      width: 100%;
      max-width: 277mm;
      margin: 0 auto;
      padding: 10mm;
      background: #fff;
    }
    
    /* Header Section */
    .header {
      border-bottom: 2px solid #000;
      padding-bottom: 12px;
      margin-bottom: 12px;
    }
    
    .header-top {
      display: flex;
      justify-content: space-between;
      font-size: 10px;
      color: #666;
      margin-bottom: 8px;
    }
    
    .company-name {
      text-align: center;
      font-size: 32px;
      font-weight: bold;
      letter-spacing: 2px;
      margin-bottom: 4px;
    }
    
    .company-tagline {
      text-align: center;
      font-size: 10px;
      color: #666;
      margin-bottom: 2px;
    }
    
    .company-address {
      text-align: center;
      font-size: 9px;
      color: #666;
    }
    
    /* Tax Invoice Title */
    .tax-invoice-title {
      text-align: center;
      border-top: 2px solid #000;
      border-bottom: 2px solid #000;
      padding: 8px 0;
      margin-bottom: 12px;
    }
    
    .tax-invoice-title h2 {
      font-size: 18px;
      font-weight: bold;
    }
    
    /* Customer & Invoice Info */
    .info-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 12px;
      font-size: 11px;
    }
    
    .info-left p, .info-right p {
      margin-bottom: 3px;
    }
    
    .info-right {
      text-align: right;
    }
    
    .info-label {
      font-weight: bold;
    }
    
    /* Items Table */
    .items-table-container {
      border: 1px solid #000;
      margin-bottom: 12px;
    }
    
    .items-table {
      width: 100%;
      border-collapse: collapse;
      font-size: 10px;
    }
    
    .items-table th,
    .items-table td {
      border: 1px solid #000;
      padding: 4px 3px;
    }
    
    .items-table thead tr {
      background-color: #f0f0f0;
    }
    
    .items-table th {
      font-weight: bold;
      text-align: center;
    }
    
    .text-center { text-align: center; }
    .text-right { text-align: right; }
    .text-left { text-align: left; }
    .font-medium { font-weight: 500; }
    .font-bold { font-weight: bold; }
    
    .border-r { border-right: 1px solid #000; }
    .border-b { border-bottom: 1px solid #000; }
    
    .h-8 { height: 24px; }
    
    .py-1 { padding-top: 3px; padding-bottom: 3px; }
    .py-2 { padding-top: 6px; padding-bottom: 6px; }
    .px-1 { padding-left: 3px; padding-right: 3px; }
    .px-2 { padding-left: 6px; padding-right: 6px; }
    
    .grand-total-row {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    
    /* Amount in Words & GST Summary */
    .summary-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      margin-bottom: 12px;
      font-size: 10px;
    }
    
    .amount-words {
      margin-bottom: 12px;
    }
    
    .amount-words p.label {
      font-weight: bold;
      margin-bottom: 2px;
    }
    
    .gst-summary-table {
      width: 100%;
      border-collapse: collapse;
      border: 1px solid #000;
    }
    
    .gst-summary-table th,
    .gst-summary-table td {
      border: 1px solid #000;
      padding: 4px 6px;
    }
    
    .gst-summary-table thead {
      background-color: #f0f0f0;
    }
    
    .gst-total-row {
      background-color: #f0f0f0;
      font-weight: bold;
    }
    
    /* Footer Section */
    .footer-section {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 16px;
      border-top: 1px solid #000;
      padding-top: 12px;
      font-size: 10px;
    }
    
    .terms h4 {
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .terms ol {
      margin-left: 16px;
      color: #666;
    }
    
    .terms ol li {
      margin-bottom: 2px;
    }
    
    .bank-details {
      margin-top: 12px;
    }
    
    .bank-details h4 {
      font-weight: bold;
      margin-bottom: 4px;
    }
    
    .signature-section {
      text-align: right;
    }
    
    .signature-section .company-for {
      font-weight: bold;
      font-style: italic;
      margin-bottom: 48px;
    }
    
    .signature-section .signature-line {
      font-style: italic;
      color: #666;
    }
    
    @media print {
      html, body {
        height: auto !important;
        min-height: unset !important;
        margin: 0 !important;
        padding: 0 !important;
        -webkit-print-color-adjust: exact;
        print-color-adjust: exact;
      }
      
      .invoice-container {
        padding: 0;
        max-width: none;
        min-height: unset !important;
        height: auto !important;
      }
    }
  </style>
</head>
<body>
  <div class="invoice-container">
    <!-- Company Header -->
    <div class="header">
      <div class="header-top">
        <span>GSTIN - 24CMAPK3117Q1ZZ</span>
        <span>Mobile - 7990713846</span>
      </div>
      <div class="company-name">S. K. ENTERPRISE</div>
      <div class="company-tagline">TRADING IN MILIGIAN SPARE & PARTS OR BRASS PARTS</div>
      <div class="company-address">SHOP NO 28, GOLDEN POINT, COMMERCIAL COMPLEX, NEAR SHIVOM CIRCLE, PHASE - III DARED, JAMNAGAR (GUJARAT) - 361 005</div>
    </div>

    <!-- Tax Invoice Title -->
    <div class="tax-invoice-title">
      <h2>Tax - Invoice</h2>
    </div>

    <!-- Customer & Invoice Info -->
    <div class="info-section">
      <div class="info-left">
        <p><span class="info-label">M/s -</span> ${invoice.customerName}</p>
        <p><span class="info-label">Address -</span> ${invoice.address || '-'}</p>
        <p><span class="info-label">GSTIN No -</span> ${invoice.gstin || '-'}</p>
      </div>
      <div class="info-right">
        <p><span class="info-label">Invoice Number:</span> ${invoice.invoiceNumber}</p>
        <p><span class="info-label">Invoice Date:</span> ${format(new Date(invoice.date), 'dd/MM/yyyy')}</p>
        <p><span class="info-label">Refrence Number:</span> -</p>
        <p><span class="info-label">Order No.:</span> ${invoice.po || '-'}</p>
      </div>
    </div>

    <!-- Items Table -->
    <div class="items-table-container">
      <table class="items-table">
        <thead>
          <tr>
            <th rowspan="2" style="width: 30px;">Sr.<br/>No.</th>
            <th rowspan="2" style="width: auto;">Particulars</th>
            <th rowspan="2" style="width: 50px;">HSN</th>
            <th rowspan="2" style="width: 40px;">QTY</th>
            <th rowspan="2" style="width: 60px;">RATE</th>
            <th rowspan="2" style="width: 70px;">AMOUNT</th>
            <th colspan="2" style="width: 100px;">CGST</th>
            <th colspan="2" style="width: 100px;">SGST</th>
            <th rowspan="2" style="width: 80px;">TOTAL</th>
          </tr>
          <tr>
            <th style="width: 40px;">Tax %</th>
            <th style="width: 60px;">AMOUNT</th>
            <th style="width: 40px;">Tax %</th>
            <th style="width: 60px;">AMOUNT</th>
          </tr>
        </thead>
        <tbody>
          ${itemRowsHTML}
          ${emptyRowsHTML}
          <!-- Grand Total Row -->
          <tr class="grand-total-row">
            <td class="border-r py-2 px-1"></td>
            <td class="border-r py-2 px-2 font-bold">Grand Total</td>
            <td class="border-r py-2 px-1"></td>
            <td class="border-r py-2 px-1"></td>
            <td class="border-r py-2 px-1"></td>
            <td class="border-r py-2 px-1 text-right">${formatNumber(totals.amount)}</td>
            <td class="border-r py-2 px-1"></td>
            <td class="border-r py-2 px-1 text-right">${formatNumber(totals.cgstAmount)}</td>
            <td class="border-r py-2 px-1"></td>
            <td class="border-r py-2 px-1 text-right">${formatNumber(totals.sgstAmount)}</td>
            <td class="py-2 px-1 text-right font-bold">${formatNumber(totals.total)}</td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Amount in Words & GST Summary -->
    <div class="summary-section">
      <div>
        <div class="amount-words">
          <p class="label">Amount Chargeble (In words)</p>
          <p class="font-medium">RUPEES - ${numberToWords(totals.total)}</p>
        </div>
        <div class="amount-words">
          <p class="label">GST Amount (In words)</p>
          <p>RUPEES - ${numberToWords(invoice.gstAmount)}</p>
        </div>
      </div>
      <div>
        <table class="gst-summary-table">
          <thead>
            <tr>
              <th colspan="2" class="text-center font-bold">GST Amount</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>CGST</td>
              <td class="text-right">${formatCurrency(totals.cgstAmount)}</td>
            </tr>
            <tr>
              <td>SGST</td>
              <td class="text-right">${formatCurrency(totals.sgstAmount)}</td>
            </tr>
            <tr class="gst-total-row">
              <td>TOTAL TAX AMOUNT</td>
              <td class="text-right">${formatCurrency(invoice.gstAmount)}</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Terms & Bank Details -->
    <div class="footer-section">
      <div>
        <div class="terms">
          <h4>Terms & Conditions</h4>
          <ol>
            <li>Goods are dispatched on buyer's risk</li>
            <li>Interest will be charges @ 12 % if bill is not paid within 7 days.</li>
            <li>In case of dispute only JAMNAGAR Court Will have JURISDICTION.</li>
          </ol>
        </div>
        <div class="bank-details">
          <h4>Bank Details</h4>
          <p>Kotak Bank A/c. Number :- 4711625484</p>
          <p>IFSC Code :- KKBK0002936</p>
        </div>
      </div>
      <div class="signature-section">
        <p class="company-for">For S. K. Enterprise</p>
        <p class="signature-line">Authorised Singture</p>
      </div>
    </div>
  </div>

  <script>
    window.onload = function() {
      setTimeout(function() {
        window.print();
      }, 250);
    };
  </script>
</body>
</html>
`;

  // Open a new window and write the HTML content
  const printWindow = window.open('', '_blank', 'width=1200,height=800');
  if (printWindow) {
    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }
}
