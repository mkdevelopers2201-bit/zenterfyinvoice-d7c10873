import { jsPDF } from 'jspdf';
import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';
import { numberToWords } from './numberToWords';

export function generateInvoicePDF(invoice: Invoice): void {
  // A3 paper size: 297 x 420 mm
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a3'
  });
  
  const pageWidth = doc.internal.pageSize.getWidth(); // 297mm for A3
  const pageHeight = doc.internal.pageSize.getHeight(); // 420mm for A3
  
  const margin = 15;
  const contentWidth = pageWidth - (margin * 2);
  let yPos = margin;

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

  // Calculate totals
  const totals = {
    amount: invoice.items.reduce((sum, item) => sum + item.amount, 0),
    cgstAmount: invoice.items.reduce((sum, item) => sum + item.cgstAmount, 0),
    sgstAmount: invoice.items.reduce((sum, item) => sum + item.sgstAmount, 0),
    total: invoice.items.reduce((sum, item) => sum + item.total, 0),
  };

  // ========== HEADER SECTION ==========
  // GSTIN and Mobile on top corners
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('GSTIN - 24CMAPK3117Q1ZZ', margin, yPos);
  doc.text('Mobile - 7990713846', pageWidth - margin, yPos, { align: 'right' });
  
  yPos += 12;
  
  // Company Name - Large, Bold, Centered
  doc.setFontSize(28);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('S. K. ENTERPRISE', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 8;
  
  // Tagline
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(60, 60, 60);
  doc.text('TRADING IN MILIGIAN SPARE & PARTS OR BRASS PARTS', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 6;
  
  // Address
  doc.setFontSize(9);
  doc.text('SHOP NO 28, GOLDEN POINT, COMMERCIAL COMPLEX, NEAR SHIVOM CIRCLE, PHASE - III DARED, JAMNAGAR (GUJARAT) - 361 005', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 6;
  
  // Double horizontal line below header
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.8);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  yPos += 2;
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  // ========== TAX INVOICE TITLE ==========
  yPos += 10;
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.text('TAX INVOICE', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 4;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  // ========== INVOICE META DATA (Split Section) ==========
  yPos += 10;
  doc.setFontSize(10);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(0, 0, 0);
  
  const leftColX = margin;
  const rightColX = pageWidth / 2 + 10;
  const labelWidth = 35;
  
  // Left side - Customer Details
  doc.setFont('helvetica', 'bold');
  doc.text('M/s:', leftColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.customerName || '-', leftColX + labelWidth, yPos);
  
  // Right side - Invoice Details
  doc.setFont('helvetica', 'bold');
  doc.text('Invoice No.:', rightColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.invoiceNumber, rightColX + 30, yPos);
  
  yPos += 7;
  doc.setFont('helvetica', 'bold');
  doc.text('Address:', leftColX, yPos);
  doc.setFont('helvetica', 'normal');
  const addressText = invoice.address || '-';
  const maxAddressWidth = pageWidth / 2 - margin - labelWidth - 10;
  const addressLines = doc.splitTextToSize(addressText, maxAddressWidth);
  doc.text(addressLines, leftColX + labelWidth, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Date:', rightColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(format(new Date(invoice.date), 'dd/MM/yyyy'), rightColX + 30, yPos);
  
  yPos += 7 * Math.max(addressLines.length, 1);
  doc.setFont('helvetica', 'bold');
  doc.text('GSTIN No.:', leftColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.gstin || '-', leftColX + labelWidth, yPos);
  
  doc.setFont('helvetica', 'bold');
  doc.text('Order No.:', rightColX, yPos);
  doc.setFont('helvetica', 'normal');
  doc.text(invoice.po || '-', rightColX + 30, yPos);
  
  // ========== ITEMS TABLE ==========
  yPos += 15;
  const tableStartY = yPos;
  
  // Column definitions with precise widths for A3
  const cols = {
    srNo: { x: margin, w: 12 },
    particulars: { x: margin + 12, w: 85 },
    hsn: { x: margin + 97, w: 25 },
    qty: { x: margin + 122, w: 20 },
    rate: { x: margin + 142, w: 28 },
    amount: { x: margin + 170, w: 30 },
    cgstPct: { x: margin + 200, w: 18 },
    cgstAmt: { x: margin + 218, w: 26 },
    sgstPct: { x: margin + 244, w: 18 },
    sgstAmt: { x: margin + 262, w: 26 },
    total: { x: margin + 288, w: 29 }
  };
  
  const tableWidth = contentWidth + 40; // Extend to use more width
  const tableEndX = margin + tableWidth - 23;
  
  // Recalculate column positions to fit within table
  const colWidths = [12, 75, 22, 18, 26, 28, 16, 24, 16, 24, 26];
  const tableActualWidth = colWidths.reduce((a, b) => a + b, 0);
  const startX = margin;
  
  // Draw table header background
  const headerHeight = 18;
  doc.setFillColor(230, 230, 230);
  doc.rect(startX, yPos, tableActualWidth, headerHeight, 'F');
  
  // Table header border
  doc.setDrawColor(0, 0, 0);
  doc.setLineWidth(0.5);
  doc.rect(startX, yPos, tableActualWidth, headerHeight, 'S');
  
  // Draw header text - Row 1
  doc.setFontSize(9);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  
  let colX = startX;
  
  // Sr. No header (spans 2 rows)
  doc.text('Sr.', colX + colWidths[0] / 2, yPos + 7, { align: 'center' });
  doc.text('No.', colX + colWidths[0] / 2, yPos + 12, { align: 'center' });
  doc.line(colX + colWidths[0], yPos, colX + colWidths[0], yPos + headerHeight);
  colX += colWidths[0];
  
  // Particulars (spans 2 rows)
  doc.text('Particulars', colX + colWidths[1] / 2, yPos + 10, { align: 'center' });
  doc.line(colX + colWidths[1], yPos, colX + colWidths[1], yPos + headerHeight);
  colX += colWidths[1];
  
  // HSN (spans 2 rows)
  doc.text('HSN', colX + colWidths[2] / 2, yPos + 10, { align: 'center' });
  doc.line(colX + colWidths[2], yPos, colX + colWidths[2], yPos + headerHeight);
  colX += colWidths[2];
  
  // QTY (spans 2 rows)
  doc.text('QTY', colX + colWidths[3] / 2, yPos + 10, { align: 'center' });
  doc.line(colX + colWidths[3], yPos, colX + colWidths[3], yPos + headerHeight);
  colX += colWidths[3];
  
  // RATE (spans 2 rows)
  doc.text('RATE', colX + colWidths[4] / 2, yPos + 10, { align: 'center' });
  doc.line(colX + colWidths[4], yPos, colX + colWidths[4], yPos + headerHeight);
  colX += colWidths[4];
  
  // AMOUNT (spans 2 rows)
  doc.text('AMOUNT', colX + colWidths[5] / 2, yPos + 10, { align: 'center' });
  doc.line(colX + colWidths[5], yPos, colX + colWidths[5], yPos + headerHeight);
  colX += colWidths[5];
  
  // CGST header (spans 2 columns)
  const cgstWidth = colWidths[6] + colWidths[7];
  doc.text('CGST', colX + cgstWidth / 2, yPos + 6, { align: 'center' });
  doc.line(colX, yPos + 9, colX + cgstWidth, yPos + 9); // Horizontal line under CGST
  doc.text('%', colX + colWidths[6] / 2, yPos + 14, { align: 'center' });
  doc.text('Amount', colX + colWidths[6] + colWidths[7] / 2, yPos + 14, { align: 'center' });
  doc.line(colX + colWidths[6], yPos + 9, colX + colWidths[6], yPos + headerHeight);
  doc.line(colX + cgstWidth, yPos, colX + cgstWidth, yPos + headerHeight);
  colX += cgstWidth;
  
  // SGST header (spans 2 columns)
  const sgstWidth = colWidths[8] + colWidths[9];
  doc.text('SGST', colX + sgstWidth / 2, yPos + 6, { align: 'center' });
  doc.line(colX, yPos + 9, colX + sgstWidth, yPos + 9); // Horizontal line under SGST
  doc.text('%', colX + colWidths[8] / 2, yPos + 14, { align: 'center' });
  doc.text('Amount', colX + colWidths[8] + colWidths[9] / 2, yPos + 14, { align: 'center' });
  doc.line(colX + colWidths[8], yPos + 9, colX + colWidths[8], yPos + headerHeight);
  doc.line(colX + sgstWidth, yPos, colX + sgstWidth, yPos + headerHeight);
  colX += sgstWidth;
  
  // TOTAL (spans 2 rows)
  doc.text('TOTAL', colX + colWidths[10] / 2, yPos + 10, { align: 'center' });
  
  yPos += headerHeight;
  
  // Draw item rows
  const rowHeight = 10;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  
  invoice.items.forEach((item, index) => {
    // Check for page break
    if (yPos > pageHeight - 80) {
      doc.addPage();
      yPos = margin;
    }
    
    colX = startX;
    const textY = yPos + 7;
    
    // Draw row bottom border
    doc.setLineWidth(0.3);
    
    // Sr. No
    doc.text(String(index + 1), colX + colWidths[0] / 2, textY, { align: 'center' });
    doc.line(colX + colWidths[0], yPos, colX + colWidths[0], yPos + rowHeight);
    colX += colWidths[0];
    
    // Particulars
    const itemName = item.name.length > 40 ? item.name.substring(0, 40) + '...' : item.name;
    doc.text(itemName, colX + 2, textY);
    doc.line(colX + colWidths[1], yPos, colX + colWidths[1], yPos + rowHeight);
    colX += colWidths[1];
    
    // HSN
    doc.text(item.hsnCode || '-', colX + colWidths[2] / 2, textY, { align: 'center' });
    doc.line(colX + colWidths[2], yPos, colX + colWidths[2], yPos + rowHeight);
    colX += colWidths[2];
    
    // QTY
    doc.text(String(item.qty), colX + colWidths[3] / 2, textY, { align: 'center' });
    doc.line(colX + colWidths[3], yPos, colX + colWidths[3], yPos + rowHeight);
    colX += colWidths[3];
    
    // Rate
    doc.text(formatNumber(item.rate), colX + colWidths[4] - 3, textY, { align: 'right' });
    doc.line(colX + colWidths[4], yPos, colX + colWidths[4], yPos + rowHeight);
    colX += colWidths[4];
    
    // Amount
    doc.text(formatNumber(item.amount), colX + colWidths[5] - 3, textY, { align: 'right' });
    doc.line(colX + colWidths[5], yPos, colX + colWidths[5], yPos + rowHeight);
    colX += colWidths[5];
    
    // CGST %
    doc.text(`${item.cgstPercent}%`, colX + colWidths[6] / 2, textY, { align: 'center' });
    doc.line(colX + colWidths[6], yPos, colX + colWidths[6], yPos + rowHeight);
    colX += colWidths[6];
    
    // CGST Amount
    doc.text(formatNumber(item.cgstAmount), colX + colWidths[7] - 3, textY, { align: 'right' });
    doc.line(colX + colWidths[7], yPos, colX + colWidths[7], yPos + rowHeight);
    colX += colWidths[7];
    
    // SGST %
    doc.text(`${item.sgstPercent}%`, colX + colWidths[8] / 2, textY, { align: 'center' });
    doc.line(colX + colWidths[8], yPos, colX + colWidths[8], yPos + rowHeight);
    colX += colWidths[8];
    
    // SGST Amount
    doc.text(formatNumber(item.sgstAmount), colX + colWidths[9] - 3, textY, { align: 'right' });
    doc.line(colX + colWidths[9], yPos, colX + colWidths[9], yPos + rowHeight);
    colX += colWidths[9];
    
    // Total
    doc.setFont('helvetica', 'bold');
    doc.text(formatNumber(item.total), colX + colWidths[10] - 3, textY, { align: 'right' });
    doc.setFont('helvetica', 'normal');
    
    yPos += rowHeight;
    
    // Draw horizontal line for row
    doc.line(startX, yPos, startX + tableActualWidth, yPos);
  });
  
  // Add empty rows if needed to fill space
  const minRows = Math.max(5, invoice.items.length);
  for (let i = invoice.items.length; i < minRows; i++) {
    // Draw vertical lines for empty rows
    colX = startX;
    colWidths.forEach((w) => {
      doc.line(colX + w, yPos, colX + w, yPos + rowHeight);
      colX += w;
    });
    yPos += rowHeight;
    doc.line(startX, yPos, startX + tableActualWidth, yPos);
  }
  
  // ========== GRAND TOTAL ROW ==========
  doc.setFillColor(230, 230, 230);
  doc.rect(startX, yPos, tableActualWidth, rowHeight + 2, 'F');
  doc.rect(startX, yPos, tableActualWidth, rowHeight + 2, 'S');
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  
  colX = startX + colWidths[0];
  const grandTotalY = yPos + 7;
  doc.text('Grand Total', colX + 2, grandTotalY);
  
  // Amount total
  colX = startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4];
  doc.text(formatNumber(totals.amount), colX + colWidths[5] - 3, grandTotalY, { align: 'right' });
  
  // CGST total
  colX += colWidths[5] + colWidths[6];
  doc.text(formatNumber(totals.cgstAmount), colX + colWidths[7] - 3, grandTotalY, { align: 'right' });
  
  // SGST total
  colX += colWidths[7] + colWidths[8];
  doc.text(formatNumber(totals.sgstAmount), colX + colWidths[9] - 3, grandTotalY, { align: 'right' });
  
  // Grand total
  colX += colWidths[9];
  doc.text(formatNumber(totals.total), colX + colWidths[10] - 3, grandTotalY, { align: 'right' });
  
  yPos += rowHeight + 2;
  
  // Draw left border and right border for entire table
  doc.setLineWidth(0.5);
  doc.line(startX, tableStartY, startX, yPos);
  doc.line(startX + tableActualWidth, tableStartY, startX + tableActualWidth, yPos);
  
  // ========== AMOUNT IN WORDS & GST SUMMARY ==========
  yPos += 12;
  
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  
  // Left side - Amount in words
  doc.text('Amount Chargeable (In Words):', margin, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`RUPEES ${numberToWords(totals.total)} ONLY`, margin, yPos);
  
  yPos += 10;
  doc.setFont('helvetica', 'bold');
  doc.text('GST Amount (In Words):', margin, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.text(`RUPEES ${numberToWords(invoice.gstAmount)} ONLY`, margin, yPos);
  
  // Right side - GST Summary Box
  const gstBoxX = pageWidth - margin - 85;
  const gstBoxY = yPos - 28;
  const gstBoxWidth = 85;
  
  // GST Amount Header
  doc.setFillColor(230, 230, 230);
  doc.rect(gstBoxX, gstBoxY, gstBoxWidth, 10, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.text('GST Amount', gstBoxX + gstBoxWidth / 2, gstBoxY + 7, { align: 'center' });
  
  // GST rows
  const gstRowHeight = 8;
  let gstRowY = gstBoxY + 10;
  
  // CGST
  doc.setLineWidth(0.3);
  doc.rect(gstBoxX, gstRowY, 42, gstRowHeight, 'S');
  doc.rect(gstBoxX + 42, gstRowY, 43, gstRowHeight, 'S');
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('CGST', gstBoxX + 5, gstRowY + 6);
  doc.text(formatCurrency(totals.cgstAmount), gstBoxX + gstBoxWidth - 5, gstRowY + 6, { align: 'right' });
  gstRowY += gstRowHeight;
  
  // SGST
  doc.rect(gstBoxX, gstRowY, 42, gstRowHeight, 'S');
  doc.rect(gstBoxX + 42, gstRowY, 43, gstRowHeight, 'S');
  doc.text('SGST', gstBoxX + 5, gstRowY + 6);
  doc.text(formatCurrency(totals.sgstAmount), gstBoxX + gstBoxWidth - 5, gstRowY + 6, { align: 'right' });
  gstRowY += gstRowHeight;
  
  // Total Tax
  doc.setFillColor(230, 230, 230);
  doc.rect(gstBoxX, gstRowY, gstBoxWidth, gstRowHeight, 'FD');
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  doc.text('TOTAL TAX AMOUNT', gstBoxX + 5, gstRowY + 6);
  doc.text(formatCurrency(invoice.gstAmount), gstBoxX + gstBoxWidth - 5, gstRowY + 6, { align: 'right' });
  
  // ========== DECLARATION SECTION ==========
  yPos += 20;
  
  // Draw separator line
  doc.setLineWidth(0.3);
  doc.line(margin, yPos, pageWidth - margin, yPos);
  
  yPos += 10;
  
  // Left side - Terms & Conditions
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text('Terms & Conditions:', margin, yPos);
  
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.setTextColor(60, 60, 60);
  const terms = [
    "1. Goods are dispatched on buyer's risk.",
    "2. Interest will be charged @ 12% if bill is not paid within 7 days.",
    "3. In case of dispute only JAMNAGAR Court will have JURISDICTION."
  ];
  terms.forEach((term, i) => {
    doc.text(term, margin, yPos + (i * 5));
  });
  
  // Bank Details
  yPos += 20;
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(0, 0, 0);
  doc.setFontSize(10);
  doc.text('Bank Details:', margin, yPos);
  yPos += 6;
  doc.setFont('helvetica', 'normal');
  doc.setFontSize(9);
  doc.text('Kotak Bank A/c. Number: 4711625484', margin, yPos);
  yPos += 5;
  doc.text('IFSC Code: KKBK0002936', margin, yPos);
  
  // Right side - Authorized Signatory
  const sigY = yPos - 25;
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(0, 0, 0);
  doc.text('For S. K. Enterprise', pageWidth - margin, sigY, { align: 'right' });
  
  // Signature line
  doc.setLineWidth(0.3);
  doc.line(pageWidth - margin - 50, sigY + 25, pageWidth - margin, sigY + 25);
  
  doc.setFont('helvetica', 'italic');
  doc.setFontSize(9);
  doc.setTextColor(80, 80, 80);
  doc.text('Authorized Signatory', pageWidth - margin, sigY + 30, { align: 'right' });

  // Save the PDF
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
