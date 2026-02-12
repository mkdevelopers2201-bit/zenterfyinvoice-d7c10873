import { Invoice } from "@/types/invoice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generateInvoicePDF = async (invoice: Invoice) => {
  const element = document.getElementById("invoice-preview");
  if (!element) {
    throw new Error("Invoice preview element not found");
  }

  // Force vertical alignment on all table cells before capture
  const allCells = element.querySelectorAll('td, th');
  allCells.forEach((cell) => {
    const el = cell as HTMLElement;
    el.style.verticalAlign = 'middle';
    el.style.display = 'table-cell';
    el.style.lineHeight = '1.2';
    el.style.height = '40px';
    el.style.padding = '8px 4px';
  });

  // Force all tr to NOT be flex
  const allRows = element.querySelectorAll('tr');
  allRows.forEach((row) => {
    const el = row as HTMLElement;
    el.style.display = 'table-row';
  });

  const canvas = await html2canvas(element, {
    scale: 2,
    useCORS: true,
    logging: false,
    backgroundColor: "#ffffff",
  });

  const imgData = canvas.toDataURL("image/png");
  const pdf = new jsPDF("p", "mm", "a4");
  const pdfWidth = pdf.internal.pageSize.getWidth();
  const pdfHeight = pdf.internal.pageSize.getHeight();

  const margin = 5; // 5mm equal margin on all sides
  const imgWidth = pdfWidth - margin * 2;
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= pdfHeight - margin * 2) {
    pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
  } else {
    // Scale to fit page height
    const fitHeight = pdfHeight - margin * 2;
    const fitWidth = (canvas.width * fitHeight) / canvas.height;
    const xOffset = (pdfWidth - fitWidth) / 2; // center horizontally
    pdf.addImage(imgData, "PNG", xOffset, margin, fitWidth, fitHeight);
  }

  const fileName = `Invoice_${invoice.invoiceNumber}.pdf`;
  pdf.save(fileName);
};
