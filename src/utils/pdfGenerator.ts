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
  
  // Colors
  const textColor: [number, number, number] = [31, 41, 55];
  const mutedColor: [number, number, number] = [107, 114, 128];
  const borderColor: [number, number, number] = [0, 0, 0];
  const headerBgColor: [number, number, number] = [240, 240, 240];

  const formatNumber = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      maximumFractionDigits: 2,
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

  const margin = 20;
  let yPos = 20;

  // Company Header
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text('GSTIN - 24CMAPK3117Q1ZZ', margin, yPos);
  doc.text('Mobile - 7990713846', pageWidth - margin, yPos, { align: 'right' });

  yPos += 10;
  doc.setFontSize(28);
  doc.setTextColor(...textColor);
  doc.text('S. K. ENTERPRISE', pageWidth / 2, yPos, { align: 'center' });

  yPos += 8;
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text('TRADING IN MILIGIAN SPARE & PARTS OR BRASS PARTS', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 5;
  doc.setFontSize(8);
  doc.text('SHOP NO 28, GOLDEN POINT, COMMERCIAL COMPLEX, NEAR SHIVOM CIRCLE, PHASE - III DARED, JAMNAGAR (GUJARAT) - 361 005', pageWidth / 2, yPos, { align: 'center' });

  // Line
  yPos += 8;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Tax Invoice Title
  yPos += 10;
  doc.setFontSize(18);
  doc.setTextColor(...textColor);
  doc.text('Tax - Invoice', pageWidth / 2, yPos, { align: 'center' });

  yPos += 5;
  doc.setLineWidth(0.5);
  doc.line(margin, yPos, pageWidth - margin, yPos);

  // Customer & Invoice Info - Two columns
  yPos += 10;
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  
  // Left column - Customer details
  const leftColX = margin;
  doc.text(`M/s - ${invoice.customerName}`, leftColX, yPos);
  
  // Right column - Invoice details
  const rightColX = pageWidth - margin;
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, rightColX, yPos, { align: 'right' });
  
  yPos += 6;
  doc.text(`Address - ${invoice.address || '-'}`, leftColX, yPos);
  doc.text(`Invoice Date: ${format(new Date(invoice.date), 'dd/MM/yyyy')}`, rightColX, yPos, { align: 'right' });
  
  yPos += 6;
  doc.text(`GSTIN No - ${invoice.gstin || '-'}`, leftColX, yPos);
  doc.text(`Refrence Number: -`, rightColX, yPos, { align: 'right' });

  yPos += 6;
  doc.text(`Order No.: ${invoice.po || '-'}`, rightColX, yPos, { align: 'right' });

  // Items Table
  yPos += 12;
  const tableStartY = yPos;
  
  // Column widths for A3 (total width = 257mm)
  const colWidths = [12, 70, 22, 18, 25, 28, 16, 22, 16, 22, 26];
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const startX = (pageWidth - tableWidth) / 2;

  // Table Header Row 1 - with background
  const headerRowHeight = 10;
  doc.setFillColor(...headerBgColor);
  doc.rect(startX, yPos, tableWidth, headerRowHeight, 'F');
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.3);
  doc.rect(startX, yPos, tableWidth, headerRowHeight, 'S');

  doc.setFontSize(9);
  doc.setTextColor(...textColor);

  // Draw first row headers
  let colX = startX;
  const headers1 = ['Sr.', 'Particulars', 'HSN', 'QTY', 'RATE', 'AMOUNT', '', '', '', '', 'TOTAL'];
  
  // Draw vertical lines and first row headers
  colWidths.forEach((width, i) => {
    if (i > 0) {
      doc.line(colX, yPos, colX, yPos + headerRowHeight * 2);
    }
    if (i === 0) {
      doc.text('Sr.', colX + width / 2, yPos + 6, { align: 'center' });
    } else if (i === 1) {
      doc.text('Particulars', colX + width / 2, yPos + 6, { align: 'center' });
    } else if (i === 2) {
      doc.text('HSN', colX + width / 2, yPos + 6, { align: 'center' });
    } else if (i === 3) {
      doc.text('QTY', colX + width / 2, yPos + 6, { align: 'center' });
    } else if (i === 4) {
      doc.text('RATE', colX + width / 2, yPos + 6, { align: 'center' });
    } else if (i === 5) {
      doc.text('AMOUNT', colX + width / 2, yPos + 6, { align: 'center' });
    } else if (i === 6) {
      // CGST header spans 2 columns
      doc.text('CGST', colX + (colWidths[6] + colWidths[7]) / 2, yPos + 6, { align: 'center' });
    } else if (i === 8) {
      // SGST header spans 2 columns  
      doc.text('SGST', colX + (colWidths[8] + colWidths[9]) / 2, yPos + 6, { align: 'center' });
    } else if (i === 10) {
      doc.text('TOTAL', colX + width / 2, yPos + 6, { align: 'center' });
    }
    colX += width;
  });

  // Header Row 2 - subheaders for CGST and SGST
  yPos += headerRowHeight;
  doc.setFillColor(...headerBgColor);
  doc.rect(startX, yPos, tableWidth, headerRowHeight, 'F');
  doc.line(startX, yPos, startX + tableWidth, yPos);
  
  // Draw second row of header
  colX = startX;
  colWidths.forEach((width, i) => {
    if (i === 6) {
      doc.text('Tax %', colX + width / 2, yPos + 6, { align: 'center' });
    } else if (i === 7) {
      doc.text('AMOUNT', colX + width / 2, yPos + 6, { align: 'center' });
    } else if (i === 8) {
      doc.text('Tax %', colX + width / 2, yPos + 6, { align: 'center' });
    } else if (i === 9) {
      doc.text('AMOUNT', colX + width / 2, yPos + 6, { align: 'center' });
    }
    colX += width;
  });

  yPos += headerRowHeight;
  doc.line(startX, yPos, startX + tableWidth, yPos);

  // Table Rows
  const rowHeight = 10;
  doc.setFontSize(9);
  
  invoice.items.forEach((item, index) => {
    if (yPos > pageHeight - 100) {
      doc.addPage();
      yPos = 30;
    }

    colX = startX;
    const rowY = yPos + rowHeight - 3;
    
    // Sr. No
    doc.text(String(index + 1), colX + colWidths[0] / 2, rowY, { align: 'center' });
    colX += colWidths[0];
    
    // Particulars
    const itemName = item.name.length > 35 ? item.name.substring(0, 35) + '...' : item.name;
    doc.text(itemName, colX + 3, rowY);
    colX += colWidths[1];
    
    // HSN
    doc.text(item.hsnCode || '-', colX + colWidths[2] / 2, rowY, { align: 'center' });
    colX += colWidths[2];
    
    // QTY
    doc.text(String(item.qty), colX + colWidths[3] / 2, rowY, { align: 'center' });
    colX += colWidths[3];
    
    // Rate
    doc.text(formatNumber(item.rate), colX + colWidths[4] - 3, rowY, { align: 'right' });
    colX += colWidths[4];
    
    // Amount
    doc.text(formatNumber(item.amount), colX + colWidths[5] - 3, rowY, { align: 'right' });
    colX += colWidths[5];
    
    // CGST %
    doc.text(`${item.cgstPercent}%`, colX + colWidths[6] / 2, rowY, { align: 'center' });
    colX += colWidths[6];
    
    // CGST Amount
    doc.text(formatNumber(item.cgstAmount), colX + colWidths[7] - 3, rowY, { align: 'right' });
    colX += colWidths[7];
    
    // SGST %
    doc.text(`${item.sgstPercent}%`, colX + colWidths[8] / 2, rowY, { align: 'center' });
    colX += colWidths[8];
    
    // SGST Amount
    doc.text(formatNumber(item.sgstAmount), colX + colWidths[9] - 3, rowY, { align: 'right' });
    colX += colWidths[9];
    
    // Total
    doc.text(formatNumber(item.total), colX + colWidths[10] - 3, rowY, { align: 'right' });

    yPos += rowHeight;
    doc.line(startX, yPos, startX + tableWidth, yPos);
  });

  // Empty rows to fill space
  const minRows = Math.max(5, invoice.items.length);
  for (let i = invoice.items.length; i < minRows; i++) {
    yPos += rowHeight;
    doc.line(startX, yPos, startX + tableWidth, yPos);
  }

  // Grand Total Row
  yPos += rowHeight;
  doc.setFillColor(...headerBgColor);
  doc.rect(startX, yPos - rowHeight, tableWidth, rowHeight, 'F');
  
  doc.setFontSize(10);
  colX = startX + colWidths[0];
  doc.text('Grand Total', colX + 3, yPos - 3);
  
  // Amount total
  colX = startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4];
  doc.text(formatNumber(totals.amount), colX + colWidths[5] - 3, yPos - 3, { align: 'right' });
  
  // CGST total
  colX += colWidths[5] + colWidths[6];
  doc.text(formatNumber(totals.cgstAmount), colX + colWidths[7] - 3, yPos - 3, { align: 'right' });
  
  // SGST total
  colX += colWidths[7] + colWidths[8];
  doc.text(formatNumber(totals.sgstAmount), colX + colWidths[9] - 3, yPos - 3, { align: 'right' });
  
  // Grand total
  colX += colWidths[9];
  doc.text(formatNumber(totals.total), colX + colWidths[10] - 3, yPos - 3, { align: 'right' });

  doc.line(startX, yPos, startX + tableWidth, yPos);

  // Draw all vertical lines for entire table
  colX = startX;
  const tableEndY = yPos;
  colWidths.forEach((width) => {
    doc.line(colX, tableStartY, colX, tableEndY);
    colX += width;
  });
  doc.line(startX + tableWidth, tableStartY, startX + tableWidth, tableEndY);

  // Amount in Words Section
  yPos += 12;
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.text('Amount Chargeble (In words)', margin, yPos);
  yPos += 6;
  doc.setFontSize(9);
  doc.text(`RUPEES - ${numberToWords(totals.total)}`, margin, yPos);
  
  yPos += 10;
  doc.setFontSize(10);
  doc.text('GST Amount (In words)', margin, yPos);
  yPos += 6;
  doc.setFontSize(9);
  doc.text(`RUPEES - ${numberToWords(invoice.gstAmount)}`, margin, yPos);

  // GST Summary Table (right side)
  const gstTableX = pageWidth - 90;
  const gstTableY = yPos - 30;
  const gstTableWidth = 70;
  
  // GST Amount Header
  doc.setFillColor(...headerBgColor);
  doc.rect(gstTableX, gstTableY, gstTableWidth, 10, 'F');
  doc.rect(gstTableX, gstTableY, gstTableWidth, 10, 'S');
  doc.setFontSize(10);
  doc.text('GST Amount', gstTableX + gstTableWidth / 2, gstTableY + 7, { align: 'center' });
  
  // CGST Row
  doc.rect(gstTableX, gstTableY + 10, 35, 8, 'S');
  doc.rect(gstTableX + 35, gstTableY + 10, 35, 8, 'S');
  doc.setFontSize(9);
  doc.text('CGST', gstTableX + 5, gstTableY + 16);
  doc.text(formatCurrency(totals.cgstAmount), gstTableX + gstTableWidth - 5, gstTableY + 16, { align: 'right' });
  
  // SGST Row
  doc.rect(gstTableX, gstTableY + 18, 35, 8, 'S');
  doc.rect(gstTableX + 35, gstTableY + 18, 35, 8, 'S');
  doc.text('SGST', gstTableX + 5, gstTableY + 24);
  doc.text(formatCurrency(totals.sgstAmount), gstTableX + gstTableWidth - 5, gstTableY + 24, { align: 'right' });
  
  // Total Tax Row
  doc.setFillColor(...headerBgColor);
  doc.rect(gstTableX, gstTableY + 26, gstTableWidth, 8, 'F');
  doc.rect(gstTableX, gstTableY + 26, gstTableWidth, 8, 'S');
  doc.setFontSize(8);
  doc.text('TOTAL TAX AMOUNT', gstTableX + 5, gstTableY + 32);
  doc.text(formatCurrency(invoice.gstAmount), gstTableX + gstTableWidth - 5, gstTableY + 32, { align: 'right' });

  // Terms & Conditions
  yPos += 18;
  doc.setFontSize(10);
  doc.setTextColor(...textColor);
  doc.text('Terms & Conditions', margin, yPos);
  yPos += 6;
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text("1) Goods are dispatched on buyer's risk", margin, yPos);
  yPos += 5;
  doc.text('2) Interest will be charges @ 12 % if bill is not paid within 7 days.', margin, yPos);
  yPos += 5;
  doc.text('3) In case of dispute only JAMNAGAR Court Will have JURISDICTION.', margin, yPos);

  // Bank Details
  yPos += 12;
  doc.setTextColor(...textColor);
  doc.setFontSize(10);
  doc.text('Bank Details', margin, yPos);
  yPos += 6;
  doc.setFontSize(9);
  doc.text('Kotak Bank A/c. Number :- 4711625484', margin, yPos);
  yPos += 5;
  doc.text('IFSC Code :- KKBK0002936', margin, yPos);

  // Signature
  doc.setFontSize(11);
  doc.setTextColor(...textColor);
  doc.text('For S. K. Enterprise', pageWidth - margin, yPos - 20, { align: 'right' });
  doc.setFontSize(9);
  doc.setTextColor(...mutedColor);
  doc.text('Authorised Singture', pageWidth - margin, yPos + 10, { align: 'right' });

  // Save
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
