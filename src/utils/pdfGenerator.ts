import { jsPDF } from 'jspdf';
import { Invoice } from '@/types/invoice';
import { format } from 'date-fns';
import { numberToWords } from './numberToWords';

export function generateInvoicePDF(invoice: Invoice): void {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();
  
  // Colors
  const textColor: [number, number, number] = [31, 41, 55];
  const mutedColor: [number, number, number] = [107, 114, 128];
  const borderColor: [number, number, number] = [0, 0, 0];

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

  let yPos = 15;

  // Company Header
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text('GSTIN - 24CMAPK3117Q1ZZ', 20, yPos);
  doc.text('Mobile - 7990713846', pageWidth - 20, yPos, { align: 'right' });

  yPos += 8;
  doc.setFontSize(24);
  doc.setTextColor(...textColor);
  doc.text('S. K. ENTERPRISE', pageWidth / 2, yPos, { align: 'center' });

  yPos += 6;
  doc.setFontSize(7);
  doc.setTextColor(...mutedColor);
  doc.text('TRADING IN MILIGIAN SPARE & PARTS OR BRASS PARTS', pageWidth / 2, yPos, { align: 'center' });
  
  yPos += 4;
  doc.text('SHOP NO 28, GOLDEN POINT, COMMERCIAL COMPLEX, NEAR SHIVOM CIRCLE, PHASE - III DARED, JAMNAGAR (GUJARAT) - 361 005', pageWidth / 2, yPos, { align: 'center' });

  // Line
  yPos += 5;
  doc.setDrawColor(...borderColor);
  doc.setLineWidth(0.5);
  doc.line(15, yPos, pageWidth - 15, yPos);

  // Tax Invoice Title
  yPos += 8;
  doc.setFontSize(14);
  doc.setTextColor(...textColor);
  doc.text('Tax - Invoice', pageWidth / 2, yPos, { align: 'center' });

  yPos += 3;
  doc.line(15, yPos, pageWidth - 15, yPos);

  // Customer & Invoice Info
  yPos += 8;
  doc.setFontSize(9);
  doc.setTextColor(...textColor);
  
  doc.text(`M/s - ${invoice.customerName}`, 20, yPos);
  doc.text(`Invoice Number: ${invoice.invoiceNumber}`, pageWidth - 20, yPos, { align: 'right' });
  
  yPos += 5;
  doc.text(`Address - ${invoice.address || '-'}`, 20, yPos);
  doc.text(`Invoice Date: ${format(new Date(invoice.date), 'dd/MM/yyyy')}`, pageWidth - 20, yPos, { align: 'right' });
  
  yPos += 5;
  doc.text(`GSTIN No - ${invoice.gstin || '-'}`, 20, yPos);
  doc.text(`Order No.: ${invoice.po || '-'}`, pageWidth - 20, yPos, { align: 'right' });

  // Items Table
  yPos += 10;
  const tableStartY = yPos;
  const colWidths = [10, 38, 15, 12, 18, 20, 12, 18, 12, 18, 20]; // Total: 193
  const tableWidth = colWidths.reduce((a, b) => a + b, 0);
  const startX = (pageWidth - tableWidth) / 2;

  // Table Header Row 1
  doc.setFillColor(245, 245, 245);
  doc.rect(startX, yPos, tableWidth, 10, 'F');
  doc.setDrawColor(...borderColor);
  doc.rect(startX, yPos, tableWidth, 10, 'S');

  doc.setFontSize(7);
  doc.setTextColor(...textColor);

  let colX = startX;
  // Draw column separators and headers
  const headers1 = ['Sr.', 'Particulars', 'HSN', 'QTY', 'RATE', 'AMOUNT', 'CGST', '', 'SGST', '', 'TOTAL'];
  colWidths.forEach((width, i) => {
    if (i > 0) {
      doc.line(colX, yPos, colX, yPos + 16);
    }
    if (i === 6) {
      doc.text('CGST', colX + width / 2 + 15, yPos + 5, { align: 'center' });
    } else if (i === 8) {
      doc.text('SGST', colX + width / 2 + 15, yPos + 5, { align: 'center' });
    } else if (headers1[i]) {
      doc.text(headers1[i], colX + width / 2, yPos + 5, { align: 'center' });
    }
    colX += width;
  });

  // Header Row 2
  yPos += 6;
  doc.line(startX, yPos, startX + tableWidth, yPos);
  
  colX = startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4] + colWidths[5];
  doc.text('Tax %', colX + colWidths[6] / 2, yPos + 4, { align: 'center' });
  colX += colWidths[6];
  doc.text('AMOUNT', colX + colWidths[7] / 2, yPos + 4, { align: 'center' });
  colX += colWidths[7];
  doc.text('Tax %', colX + colWidths[8] / 2, yPos + 4, { align: 'center' });
  colX += colWidths[8];
  doc.text('AMOUNT', colX + colWidths[9] / 2, yPos + 4, { align: 'center' });

  yPos += 6;
  doc.line(startX, yPos, startX + tableWidth, yPos);

  // Table Rows
  const rowHeight = 8;
  invoice.items.forEach((item, index) => {
    if (yPos > 240) {
      doc.addPage();
      yPos = 20;
    }

    yPos += rowHeight;
    colX = startX;
    
    doc.text(String(index + 1), colX + colWidths[0] / 2, yPos - 2, { align: 'center' });
    colX += colWidths[0];
    
    doc.text(item.name.substring(0, 20), colX + 2, yPos - 2);
    colX += colWidths[1];
    
    doc.text(item.hsnCode || '-', colX + colWidths[2] / 2, yPos - 2, { align: 'center' });
    colX += colWidths[2];
    
    doc.text(String(item.qty), colX + colWidths[3] / 2, yPos - 2, { align: 'center' });
    colX += colWidths[3];
    
    doc.text(formatNumber(item.rate), colX + colWidths[4] - 2, yPos - 2, { align: 'right' });
    colX += colWidths[4];
    
    doc.text(formatNumber(item.amount), colX + colWidths[5] - 2, yPos - 2, { align: 'right' });
    colX += colWidths[5];
    
    doc.text(`${item.cgstPercent}%`, colX + colWidths[6] / 2, yPos - 2, { align: 'center' });
    colX += colWidths[6];
    
    doc.text(formatNumber(item.cgstAmount), colX + colWidths[7] - 2, yPos - 2, { align: 'right' });
    colX += colWidths[7];
    
    doc.text(`${item.sgstPercent}%`, colX + colWidths[8] / 2, yPos - 2, { align: 'center' });
    colX += colWidths[8];
    
    doc.text(formatNumber(item.sgstAmount), colX + colWidths[9] - 2, yPos - 2, { align: 'right' });
    colX += colWidths[9];
    
    doc.text(formatNumber(item.total), colX + colWidths[10] - 2, yPos - 2, { align: 'right' });

    doc.line(startX, yPos, startX + tableWidth, yPos);
  });

  // Empty rows
  const minRows = Math.max(5, invoice.items.length);
  for (let i = invoice.items.length; i < minRows; i++) {
    yPos += rowHeight;
    doc.line(startX, yPos, startX + tableWidth, yPos);
  }

  // Grand Total Row
  yPos += rowHeight;
  doc.setFillColor(245, 245, 245);
  doc.rect(startX, yPos - rowHeight, tableWidth, rowHeight, 'F');
  
  colX = startX + colWidths[0];
  doc.setFontSize(8);
  doc.text('Grand Total', colX + 2, yPos - 2);
  
  colX = startX + colWidths[0] + colWidths[1] + colWidths[2] + colWidths[3] + colWidths[4];
  doc.text(formatNumber(totals.amount), colX + colWidths[5] - 2, yPos - 2, { align: 'right' });
  colX += colWidths[5] + colWidths[6];
  doc.text(formatNumber(totals.cgstAmount), colX + colWidths[7] - 2, yPos - 2, { align: 'right' });
  colX += colWidths[7] + colWidths[8];
  doc.text(formatNumber(totals.sgstAmount), colX + colWidths[9] - 2, yPos - 2, { align: 'right' });
  colX += colWidths[9];
  doc.text(formatNumber(totals.total), colX + colWidths[10] - 2, yPos - 2, { align: 'right' });

  doc.line(startX, yPos, startX + tableWidth, yPos);

  // Draw vertical lines for entire table
  colX = startX;
  colWidths.forEach((width, i) => {
    doc.line(colX, tableStartY, colX, yPos);
    colX += width;
  });
  doc.line(startX + tableWidth, tableStartY, startX + tableWidth, yPos);

  // Amount in Words Section
  yPos += 8;
  doc.setFontSize(8);
  doc.text('Amount Chargeble (In words)', 20, yPos);
  yPos += 5;
  doc.text(`RUPEES - ${numberToWords(totals.total)}`, 20, yPos);
  
  yPos += 6;
  doc.text('GST Amount (In words)', 20, yPos);
  yPos += 5;
  doc.text(`RUPEES - ${numberToWords(invoice.gstAmount)}`, 20, yPos);

  // GST Summary Table (right side)
  const gstTableX = pageWidth - 75;
  const gstTableY = yPos - 20;
  
  doc.setFillColor(245, 245, 245);
  doc.rect(gstTableX, gstTableY, 55, 8, 'F');
  doc.rect(gstTableX, gstTableY, 55, 8, 'S');
  doc.text('GST Amount', gstTableX + 27.5, gstTableY + 5, { align: 'center' });
  
  doc.rect(gstTableX, gstTableY + 8, 30, 6, 'S');
  doc.rect(gstTableX + 30, gstTableY + 8, 25, 6, 'S');
  doc.text('CGST', gstTableX + 3, gstTableY + 12);
  doc.text(formatCurrency(totals.cgstAmount), gstTableX + 52, gstTableY + 12, { align: 'right' });
  
  doc.rect(gstTableX, gstTableY + 14, 30, 6, 'S');
  doc.rect(gstTableX + 30, gstTableY + 14, 25, 6, 'S');
  doc.text('SGST', gstTableX + 3, gstTableY + 18);
  doc.text(formatCurrency(totals.sgstAmount), gstTableX + 52, gstTableY + 18, { align: 'right' });
  
  doc.setFillColor(245, 245, 245);
  doc.rect(gstTableX, gstTableY + 20, 30, 6, 'F');
  doc.rect(gstTableX + 30, gstTableY + 20, 25, 6, 'F');
  doc.rect(gstTableX, gstTableY + 20, 55, 6, 'S');
  doc.setFontSize(7);
  doc.text('TOTAL TAX AMOUNT', gstTableX + 3, gstTableY + 24);
  doc.text(formatCurrency(invoice.gstAmount), gstTableX + 52, gstTableY + 24, { align: 'right' });

  // Terms & Conditions
  yPos += 12;
  doc.setFontSize(8);
  doc.text('Terms & Conditions', 20, yPos);
  yPos += 5;
  doc.setFontSize(7);
  doc.setTextColor(...mutedColor);
  doc.text('1) Goods are dispatched on buyer\'s risk', 20, yPos);
  yPos += 4;
  doc.text('2) Interest will be charges @ 12 % if bill is not paid within 7 days.', 20, yPos);
  yPos += 4;
  doc.text('3) In case of dispute only JAMNAGAR Court Will have JURISDICTION.', 20, yPos);

  // Bank Details
  yPos += 8;
  doc.setTextColor(...textColor);
  doc.setFontSize(8);
  doc.text('Bank Details', 20, yPos);
  yPos += 5;
  doc.setFontSize(7);
  doc.text('Kotak Bank A/c. Number :- 4711625484', 20, yPos);
  yPos += 4;
  doc.text('IFSC Code :- KKBK0002936', 20, yPos);

  // Signature
  doc.setFontSize(9);
  doc.setTextColor(...textColor);
  doc.text('For S. K. Enterprise', pageWidth - 20, yPos - 15, { align: 'right' });
  doc.setFontSize(8);
  doc.setTextColor(...mutedColor);
  doc.text('Authorised Singture', pageWidth - 20, yPos + 5, { align: 'right' });

  // Save
  doc.save(`${invoice.invoiceNumber}.pdf`);
}
