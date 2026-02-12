import { Invoice } from "@/types/invoice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generateInvoicePDF = async (invoice: Invoice) => {
  const element = document.getElementById("invoice-preview");
  if (!element) {
    throw new Error("Invoice preview element not found");
  }

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

  const imgWidth = pdfWidth - 10; // 5mm margin each side
  const imgHeight = (canvas.height * imgWidth) / canvas.width;

  if (imgHeight <= pdfHeight - 10) {
    pdf.addImage(imgData, "PNG", 5, 5, imgWidth, imgHeight);
  } else {
    // Scale to fit page
    const scale = (pdfHeight - 10) / imgHeight;
    pdf.addImage(imgData, "PNG", 5, 5, imgWidth * scale, (pdfHeight - 10));
  }

  const fileName = `Invoice_${invoice.invoiceNumber}.pdf`;
  pdf.save(fileName);
};
