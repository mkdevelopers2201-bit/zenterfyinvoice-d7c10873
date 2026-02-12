import { Invoice } from "@/types/invoice";
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export const generateInvoicePDF = async (invoice: Invoice) => {
  const element = document.getElementById("invoice-preview");
  if (!element) {
    throw new Error("Invoice preview element not found");
  }

  // STEP 1: Capture the original scroll position and width to prevent shifting
  const originalWidth = element.style.width;
  
  try {
    // STEP 2: Give the browser 150ms to ensure the preview is fully rendered
    // This prevents capturing the "stretching" animation
    await new Promise(resolve => setTimeout(resolve, 150));

    const canvas = await html2canvas(element, {
      scale: 3, // High quality for Pappa's phone
      useCORS: true,
      logging: false,
      backgroundColor: "#ffffff",
      // Force the width during capture to stop the "Stretch" bug
      windowWidth: 800, 
    });

    const imgData = canvas.toDataURL("image/png", 1.0);
    const pdf = new jsPDF("p", "mm", "a4");
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const margin = 10; // 10mm margin for a clean look

    const imgWidth = pdfWidth - (margin * 2);
    const imgHeight = (canvas.height * imgWidth) / canvas.width;

    // STEP 3: Add image to PDF
    if (imgHeight <= pdfHeight - (margin * 2)) {
      pdf.addImage(imgData, "PNG", margin, margin, imgWidth, imgHeight);
    } else {
      const fitHeight = pdfHeight - (margin * 2);
      const fitWidth = (canvas.width * fitHeight) / canvas.height;
      const xOffset = (pdfWidth - fitWidth) / 2;
      pdf.addImage(imgData, "PNG", xOffset, margin, fitWidth, fitHeight);
    }

    pdf.save(`Invoice_${invoice.invoiceNumber}.pdf`);
  } catch (error) {
    console.error("PDF Generation Error:", error);
  } finally {
    // Restore original width if it was changed
    element.style.width = originalWidth;
  }
};
